import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPageBooks(browser) {
  const page = await browser.newPage();
  const url = 'https://store.kyobobook.co.kr/bestseller/total/weekly?page=1';
  await page.goto(url, { waitUntil: 'networkidle2' });
  await sleep(2000);

  const { books, links } = await page.evaluate(() => {
    const books = [];
    const links = [];

    document.querySelectorAll('ol li').forEach(li => {
      const titleEl = li.querySelector('a.prod_link.line-clamp-2.font-medium.text-black');
      const title = titleEl?.innerText.trim() || '';
      const detailHref = titleEl?.href || '';
      const coverImage = li.querySelector('a.prod_link.relative img')?.src || '';
      const authorText = li.querySelector('div.line-clamp-2.flex')?.innerText || '';
      const author = authorText.split('·')[0]?.trim() || '';
      const publisher = authorText.split('·')[1]?.trim() || '';

      if (title && author && publisher && coverImage && detailHref) {
        books.push({ title, author, publisher, coverImage });
        links.push(detailHref);
      }
    });

    return { books, links };
  });

  await page.close();
  return { books, links };
}

async function fetchBookDetail(browser, link) {
  const detailPage = await browser.newPage();
  await detailPage.goto(link, { waitUntil: 'networkidle2' });

  const data = await detailPage.evaluate(() => {
    const writerInfo = document.querySelector('div.writer_info_box .auto_overflow_inner p.info_text')?.innerText.trim() || '';
    const contents = document.querySelector('li.book_contents_item')?.innerText.trim() || '';
    const publisherReview = document.querySelector('div.product_detail_area.book_publish_review .auto_overflow_inner p.info_text')?.innerText.trim() || '';
    return { writerInfo, contents, publisherReview };
  });

  await detailPage.close();
  return data;
}

export default async function kyoboScrapper() {
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

  const resultPath = path.join(process.cwd(), './json_results/kyobo.json');
  fs.writeFileSync(resultPath, JSON.stringify(books, null, 2), 'utf-8');

  console.log(`✅ Crawled ${books.length} books`);
  console.log(`💾 Saved to ${resultPath}`);
  console.log(`⏱ Done in ${(Date.now() - startTime) / 1000}s`);
  
  await browser.close();
}

// Run directly
kyoboScrapper();