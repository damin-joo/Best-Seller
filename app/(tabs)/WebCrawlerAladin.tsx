import cheerio from "cheerio-without-node-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { GlobalStyles } from "../styles/global";

// Web crawler component for Aladin
export default function WebCrawlerAladin() {
    const [imageLinks, setImageLinks] = useState<string[]>([]);
    const [bookTitles, setBookTitles] = useState<string[]>([]);
    const [author, setAuthor] = useState<string[]>([]);
    const [authorInfo, setAuthorInfo] = useState<string[]>([]);
    const [outline, setOutline] = useState<string[][]>([]); // each book can have multiple outline items
    const [publisherRemarks, setPublisherRemarks] = useState<string[][]>([]); // each book can have multiple remarks
    const [loading, setLoading] = useState(true);

    // fetch HTML helper
    const getHTML = async (url: string): Promise<string> => {
        try {
            const response = await fetch(url);
            return await response.text();
        } catch (error) {
            console.error("Failed to fetch HTML:", error);
            return "";
        }
    };

    const crawlTitle = async () => {
        const URL = "https://www.aladin.co.kr/shop/common/wbest.aspx?BranchType=1";
        const html = await getHTML(URL);
        if (!html) return;

        const $ = cheerio.load(html);

        // Book elements
        const links: string[] = $("a.bo3").map((_: number, el: any) => $(el).attr("href")).get().slice(0, 30);
        const images: string[] = $(".front_cover").map((_: number, el: any) => $(el).attr("src")).get().slice(0, 30);
        const titles: string[] = $("a.bo3").map((_: number, el: any) => $(el).text()).get().slice(0, 30);
        const authors: string[] = $(".ss_book_list ul li:nth-child(3) a:nth-child(1)").map((_: number, el: any) => $(el).text()).get().slice(0, 30);

        setImageLinks(images);
        setBookTitles(titles);
        setAuthor(authors);

        // Crawl detail pages for each book (limit 30)
        const authorInfoArray: string[] = [];
        const outlineArray: string[][] = [];
        const publisherRemarksArray: string[][] = [];

        await Promise.all(
            links.map(async (link, idx) => {
                const bookHTML = await getHTML(link);
                if (!bookHTML) return;

                const $book = cheerio.load(bookHTML);

                //span.Ere_bo_title

                // Author info
                // const authorInfoTag = $book("span.Ere_bo_title").text().trim();
                const authorInfoTag = $book("div[id^='div_AuthorInfo_'][id$='_Short']").text().trim();
                authorInfoArray[idx] = authorInfoTag;

                // Outline
                // const outlineTag = $book("span.Ere_bo_title").map((_: number, el: any) => $book(el).text().trim()).get();
                const outlineTag = $book("div#tocTemplate div[id^='div_TOC_'][id$='_Short']").map((_: number, el: any) => $book(el).text()).get();
                outlineArray[idx] = outlineTag;

                // Publisher remarks
                const publisherRemarksTag = $book("div.Ere_prod_mconts_R").map((_: number, el: any) => $book(el).text()).get();             
                publisherRemarksArray[idx] = publisherRemarksTag;
            })
        );

        setAuthorInfo(authorInfoArray);
        setOutline(outlineArray);
        setPublisherRemarks(publisherRemarksArray);

        setLoading(false);
    };

    useEffect(() => {
        crawlTitle();
    }, []);

    return (
        <View style={GlobalStyles.container}>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <ScrollView>
                    {Array.from({ length: imageLinks.length }).map((_, idx) => (
                        <View key={idx} style={{ marginBottom: 20, borderBottomWidth: 1, borderColor: "#ccc", paddingBottom: 10 }}>
                            <Image
                                source={{ uri: imageLinks[idx] }}
                                style={{ width: 100, height: 150, marginBottom: 10 }}
                                resizeMode="contain"
                            />
                            <Text style={{ fontWeight: "bold" }}>Title:</Text>
                            <Text>{bookTitles[idx]}</Text>

                            <Text style={{ fontWeight: "bold" }}>Author:</Text>
                            <Text>{author[idx]}</Text>

                            <Text style={{ fontWeight: "bold" }}>Author Info:</Text>
                            <Text>{authorInfo[idx]}</Text>

                            <Text style={{ fontWeight: "bold" }}>Outline:</Text>
                            {outline[idx]?.map((o, i) => (
                                <Text key={i}>{o}</Text>
                            ))}

                            <Text style={{ fontWeight: "bold" }}>Publisher Remarks:</Text>
                            {publisherRemarks[idx]?.map((pr, i) => (
                                <Text key={i}>{pr}</Text>
                            ))}
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}