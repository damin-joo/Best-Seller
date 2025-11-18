import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPageBooks(browser) {
    const page = await browser.newPage();
    const url = 'https://www.amazon.fr/gp/bestsellers/books?utm_source=chatgpt.com';
    await page.goto(url, { waitUntil: 'networkidle2' });
    await sleep(2000);

    const { books, links } = await page.evaluate(() => {
        const books = [];
        const links = [];

        const items = document.querySelectorAll('ol li.zg-no-numbers');
        for (let i = 0; i < items.length; i++) {
            if (books.length >= 20) break;

            const li = items[i];
            const detailHref = li.querySelector('div a.a-link-normal')?.href || '';
            const title = li.querySelector('div a.a-link-normal span div')?.innerText || '';
            const coverImage = li.querySelector('div.a-section img')?.src || '';
            const author = li.querySelector('div a.a-size-small div')?.innerText || '';

            if (title && author && coverImage && detailHref) {
            books.push({ title, author, coverImage });
            links.push(detailHref);
            }
        };

        return { books, links };
    });

    await page.close();
    return { books, links };
}

async function fetchBookDetail(browser, link) {
    const detailPage = await browser.newPage();
    await detailPage.goto(link, { waitUntil: 'networkidle2' });

    const data = await detailPage.evaluate(() => {
        const aboutAuthor = document.querySelector('div.a-cardui-content')?.innerText.trim() || '';
        const bookSummary = document.querySelector('div.a-container div.a-expander-content')?.innerText.trim() || '';
        return { writerInfo: aboutAuthor, contents: bookSummary, publisherReview: '' };
    });

    await detailPage.close();
    return data;
}

export default async function amazonScrapper() {
    const startTime = Date.now();
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const { books, links } = await fetchPageBooks(browser);
    const concurrency = 5;

    for (let i = 0; i < books.length; i += concurrency) {
        const batchBooks = books.slice(i, i + concurrency);
        const batchLinks = links.slice(i, i + concurrency);

        const results = await Promise.allSettled(
        batchLinks.map(link => fetchBookDetail(browser, link))
        );

        results.forEach((res, idx) => {
        const data = res.status === 'fulfilled' ? res.value : { writerInfo: '', contents: '', publisherReview: '' };
        batchBooks[idx].writerInfo = data.writerInfo;
        batchBooks[idx].contents = data.contents;
        batchBooks[idx].publisherReview = data.publisherReview;
        console.log(`${i + idx + 1}. ${batchBooks[idx].title} ✅`);
        });
    }

    const resultPath = path.join(process.cwd(), '../json_results/amazon.json');
    fs.writeFileSync(resultPath, JSON.stringify(books, null, 2), 'utf-8');

    console.log(`✅ Crawled ${books.length} books`);
    console.log(`💾 Saved to ${resultPath}`);
    console.log(`⏱ Done in ${(Date.now() - startTime) / 1000}s`);
    await browser.close();
}

// Run directly
amazonScrapper();