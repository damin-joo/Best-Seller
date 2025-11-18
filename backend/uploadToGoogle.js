import fs from "fs";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";

// import aladinScrapper from "./scrappers/aladinScrapper.js";
// import amazonScrapper from "./scrappers/amazonScrapper";
// import gibertScrapper from "./scrappers/gibertScrapper";
// import kyoboScrapper from "./scrappers/kyoboScrapper.js";
// import taiwanScrapper from "./scrappers/taiwanScrapper.js";

// Helper: read JSON and format rows
function readBooksJSON(filename) {
  const jsonPath = `./json_results/${filename}`;
  if (!fs.existsSync(jsonPath)) {
    console.error(`⚠️ File not found: ${jsonPath}`);
    return [];
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  const rows = data.map((book) => [
    book.coverImage || "",
    book.title || "",
    book.author || "",
    book.writerInfo || "",
    book.contents || "",
    book.publisherReview || ""
  ]);

  return rows;
}

// Batch update multiple sheets
async function batchUpdateValues(spreadsheetId, valueInputOption, data) {
  const auth = new GoogleAuth({
    keyFile: "./credentials.json", // your service account JSON
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const sheets = google.sheets({ version: "v4", auth });

  const resource = {
    data,
    valueInputOption,
  };

  const result = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource,
  });

  console.log(`✅ Updated ${result.data.totalUpdatedCells} cells.`);
}

// Main function
(async () => {
  // Run scrapers
  // await aladinScrapper();
  // await amazonScrapper();
  // await gibertScrapper();
  // await kyoboScrapper();
  // await taiwanScrapper();


  const spreadsheetId = "12YyTh3oZQhyKLIjee-TlDmoDAqa_X76v3yIpil3zq4U";

  const uploadData = [
    {
      range: "Aladin!B2",
      values: readBooksJSON("aladin.json"),
    },
    {
      range: "Amazon!B2",
      values: readBooksJSON("amazon.json"),
    },
    {
      range: "Kyobo!B2",
      values: readBooksJSON("kyobo.json"),
    },
    {
      range: "Taiwan!B2",
      values: readBooksJSON("taiwan.json"),
    },
  ];

  await batchUpdateValues(spreadsheetId, "RAW", uploadData);
})();