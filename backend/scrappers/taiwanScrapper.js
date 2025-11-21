import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPageBooks(browser) {
    const page = await browser.newPage();
    const url = "https://www.books.com.tw/web/sys_saletopb/books/?attribute=";
    await page.goto(url, { waitUntil: "networkidle2" });
    await sleep(2000);

    const { books, links } = await page.evaluate(() => {
        const books = [];
        const links = [];

        const items = document.querySelectorAll("ul.clearfix li");
        for (let i = 0; i < items.length; i++) {
            if (books.length >= 20) break; // stop after 20 books

            const li = items[i];
            const title = li.querySelector("div.type02_bd-a h4 a")?.innerText.trim() || "";
            const detailHref = li.querySelector("a")?.href || "";
            const coverImage = li.querySelector("a img")?.src || "";
            const author = li.querySelector("div.type02_bd-a ul.msg li a")?.innerText.trim() || "";

            if (title && author && coverImage && detailHref) {
            books.push({ title, author, coverImage });
            links.push(detailHref);
            }
        }

        return { books, links };
    });

    await page.close();
    return { books, links };
}

async function fetchBookDetail(browser, link) {
    const page = await browser.newPage();
    await page.goto(link, { waitUntil: "networkidle2" });
    await sleep(1500);

    const data = await page.evaluate(() => { 
        const contents = document.querySelector('body div.container_24.main_wrap.clearfix div.grid_19.alpha div.content:first-of-type')?.innerText.trim() || '';
        const outline = document.querySelector('#M201105_0_getProdTextInfo_P00a400020009_h2')?.innerText.trim() || '';
        const writerInfo = document.querySelector('body div.container_24.main_wrap.clearfix div.grid_19.alpha div.content::nth-of-type(2)')?.innerText.trim() || '';
    
        return { contents, outline, writerInfo };
    });

    await page.close();
    return data;
}

export default async function taiwanScraper() {
    const startTime = Date.now();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    console.log("📖 Fetching bestseller list...");
    const { books, links } = await fetchPageBooks(browser);

    const concurrency = 5;
    for (let i = 0; i < books.length; i += concurrency) {
        const batchBooks = books.slice(i, i + concurrency);
        const batchLinks = links.slice(i, i + concurrency);

        const results = await Promise.allSettled(
        batchLinks.map((link) => fetchBookDetail(browser, link))
        );

        results.forEach((res, idx) => {
            const data = res.status === 'fulfilled' ? res.value : { contents: '', outline: '', writerInfo: '' }; 
            batchBooks[idx].contents = data.contents;
            batchBooks[idx].outline = data.outline;
            batchBooks[idx].writerInfo = data.writerInfo;
            console.log(`${i + idx + 1}. ${batchBooks[idx].title} ✅`);
        });
    }

    const resultPath = path.join(process.cwd(), '../json_results/taiwan.json');
        fs.writeFileSync(resultPath, JSON.stringify(books, null, 2), 'utf-8');

    console.log(`✅ Crawled ${books.length} books`);
    console.log(`Saved to ${resultPath}`);
    console.log(`Done in ${(Date.now() - startTime) / 1000}s`);

    await browser.close();
}

// Run directly
taiwanScraper();