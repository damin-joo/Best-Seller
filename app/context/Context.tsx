import React, { createContext, useContext, useEffect, useState } from "react";

type LanguageContextType = {
  language: number;
  setLanguage: React.Dispatch<React.SetStateAction<number>>;
  country: number;
  setCountry: React.Dispatch<React.SetStateAction<number>>;
  translations: string[][];
  data: string[][];
  filteredData: string[][];
  loading: boolean;
  error: string | null;
  fetchSheets: () => Promise<void>;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState(0);
    const [country, setCountry] = useState(0);

    const [translations, setTranslations] = useState<string[][]>([]);
    const [data, setData] = useState<string[][]>([]);
    const [filteredData, setFilteredData] = useState<string[][]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // const TRANSLATION_URL = "https://docs.google.com/spreadsheets/d/1GoeMU5HbM7g2jujoO5vBI6Z1BH_EjUtnVmV9zWAKpHs/export?format=tsv&gid=0&range=A1:C4";
    // const KOREAN_DATA_URL = "https://docs.google.com/spreadsheets/d/1GoeMU5HbM7g2jujoO5vBI6Z1BH_EjUtnVmV9zWAKpHs/export?format=tsv&gid=161667220&range=A1:P31";

    //Min (cloned for test)
    const TRANSLATION_URL = "https://docs.google.com/spreadsheets/d/12YyTh3oZQhyKLIjee-TlDmoDAqa_X76v3yIpil3zq4U/export?format=tsv&gid=0&range=A1:C4";
    const KOREAN_DATA_URL = "https://docs.google.com/spreadsheets/d/12YyTh3oZQhyKLIjee-TlDmoDAqa_X76v3yIpil3zq4U/export?format=tsv&gid=161667220&range=A1:P31";

    const fetchSheets = async () => {
        try {
        setLoading(true);
        setError(null);

        const tResp = await fetch(TRANSLATION_URL);
        if (!tResp.ok) throw new Error(`Translation HTTP ${tResp.status}`);
        const tsv1 = await tResp.text();
        const parsedTranslations = parseTSV(tsv1);
        setTranslations(parsedTranslations);

        const dResp = await fetch(KOREAN_DATA_URL);
        if (!dResp.ok) throw new Error(`Data HTTP ${dResp.status}`);
        const tsv2 = await dResp.text();
        const parsedData = parseTSV(tsv2);
        setData(parsedData);

        // initial filter
        const filtered = filterCol(parsedData, language);
        setFilteredData(filtered);
        } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        } finally {
        setLoading(false);
        }
    };

    // run fetchSheets
    useEffect(() => {
        fetchSheets();
    }, []);

    // whenever language changes, re-filter data
    useEffect(() => {
        if (data.length > 0) {
        const filtered = filterCol(data, language);
        setFilteredData(filtered);
        }
    }, [language, data]);

    // // whenever country chages, re-fetch data
    // useEffect(() => {
    //     if (data.length > 0) {
    //     const filtered = filterCol(data, language);
    //     setFilteredData(filtered);
    //     }
    // }, [country, data]);

    const parseTSV = (text: string): string[][] =>
        text
        .trim()
        .split("\n")
        .map((line) => line.split("\t").map((cell) => cell.trim()));

    const filterCol = (data: string[][], languageIndex: number): string[][] =>
        data.map((row) => row.slice(languageIndex * 5 + 1, languageIndex * 5 + 6));

    return (
        <LanguageContext.Provider
            value={{ 
                language, 
                setLanguage, 
                country, 
                setCountry, 
                translations, 
                data, 
                filteredData, 
                loading, 
                error, 
                fetchSheets, 
            }}
        >
        {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
    return context;
};
