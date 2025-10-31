import cheerio from "cheerio-without-node-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

//제목	저자	작가정보	목차	출판사 서평
export default function WebCrawler() {
    const [bookTitle, setBookTitle] = useState("");
    // const [author, setAuthor] = useState<string[]>([]);
    // const [authorInfo, setAuthorInfo] = useState<string[]>([]);
    // const [outline, setOutline] = useState<string[]>([]);
    // const [publisherRemarks, setPublisherRemarks] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // function to fetch HTML
    const getHTML = async (url: string): Promise<string> => {
        try {
            const response = await fetch(url, {
                headers: {
                    "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36",
                    "Accept-Language": "ko,en;q=0.9",
                },
            });
            return await response.text();
        } catch (error) {
            console.error("Failed to fetch HTML:", error);
            return "";
        }
    };


    // function to crawl the title
    const crawlTitle = async () => {
        /*
        import puppeteer from 'puppeteer';

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://store.kyobobook.co.kr/bestseller/total/weekly', { waitUntil: 'networkidle0' });

        const titles = await page.$$eval('.prod_info .title', el => el.map(e => e.textContent));
        console.log(titles);

        await browser.close();
        */

        // const URL = "https://store.kyobobook.co.kr/bestseller/total/weekly";
        // // const URL = "https://www.aladin.co.kr/shop/common/wbest.aspx?BranchType=1";
        // const html = await getHTML(URL);

        const html = await getHTML("https://store.kyobobook.co.kr/bestseller/total/weekly");
        console.log(html.slice(0, 1000));


        if (!html) return;

        const $ = cheerio.load(html);

        const title = $("a").text();
        setBookTitle(title);

        const authorTag = $("title").text();

        const authorInfoTag = $("title").text();

        const outlineTag = $("title").text();

        const publisherRemarksTag = $("title").text();

        setLoading(false);
    };

    // run crawl on component mount
    useEffect(() => {
        crawlTitle();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {loading ? <ActivityIndicator size="large" /> : <Text>{bookTitle}</Text>}
        
        </View>
    );
}