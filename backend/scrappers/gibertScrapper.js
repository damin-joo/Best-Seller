import fs from 'fs';
import path from 'path';
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPageBooks(browser) {
  const page = await browser.newPage();
  const url = 'https://www.gibert.com/livres/livres-meilleures-ventes-2570.html';
  await page.goto(url, { waitUntil: 'networkidle2' });
  await sleep(2000);

  const { books, links } = await page.evaluate(() => {
    const books = [];
    const links = [];

    const items = document.querySelectorAll('ol li');
    for (let i = 0; i < items.length; i++) {
        if (books.length >= 20) break;

        const li = items[i];
        const title = li.querySelector('div div strong a')?.innerText || '';
        const detailHref = li.querySelector('div.product-item-info a')?.href || '';
        const coverImage = li.querySelector('div a span span img')?.src || '';
        const author = li.querySelector('div div p.author a')?.innerText || '';

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
    const contents = document.querySelector('div.product.attribute.description div.value')?.innerText.trim() || '';
    const categories = document.querySelector('td.col.data')?.innerText.trim() || '';
    return { writerInfo: '', contents: contents, publisherReview: categories };
  });

  await detailPage.close();
  return data;
}

export default async function gibertScrapper() {
  const startTime = Date.now();
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./gibert_profile",
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
      const data = res.status === 'fulfilled' ? res.value : { contents: '', contents: '', publisherReview: '' };
      batchBooks[idx].writerInfo = data.writerInfo;
      batchBooks[idx].contents = data.contents;
      batchBooks[idx].publisherReview = data.publisherReview;
      console.log(`${i + idx + 1}. ${batchBooks[idx].title} ✅`);
    });
  }

  const resultPath = path.join(process.cwd(), '../json_results/gibert.json');
  fs.writeFileSync(resultPath, JSON.stringify(books, null, 2), 'utf-8');

  console.log(`✅ Crawled ${books.length} books`);
  console.log(`💾 Saved to ${resultPath}`);
  console.log(`⏱ Done in ${(Date.now() - startTime) / 1000}s`);
  await browser.close();
}

// Run directly
gibertScrapper();