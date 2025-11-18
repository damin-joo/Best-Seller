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

    // Google Sheet URLs
    const TRANSLATION_URL = "https://docs.google.com/spreadsheets/d/12YyTh3oZQhyKLIjee-TlDmoDAqa_X76v3yIpil3zq4U/export?format=tsv&gid=0&range=A1:G8";
    const ALADIN_DATA_URL = "https://docs.google.com/spreadsheets/d/12YyTh3oZQhyKLIjee-TlDmoDAqa_X76v3yIpil3zq4U/export?format=tsv&gid=335147367&range=A1:AA21";
    const KYOBO_DATA_URL = "https://docs.google.com/spreadsheets/d/12YyTh3oZQhyKLIjee-TlDmoDAqa_X76v3yIpil3zq4U/export?format=tsv&gid=2081532940&range=A1:AA21";
    const THAIWAN_DATA_URL = "https://docs.google.com/spreadsheets/d/12YyTh3oZQhyKLIjee-TlDmoDAqa_X76v3yIpil3zq4U/export?format=tsv&gid=970940357&range=A1:AA21";
    const AMAZON_DATA_URL = "https://docs.google.com/spreadsheets/d/12YyTh3oZQhyKLIjee-TlDmoDAqa_X76v3yIpil3zq4U/export?format=tsv&gid=1693299870&range=A1:AA21";

    // Parse TSV to array
    const parseTSV = (text: string): string[][] =>
        text
        .trim()
        .split("\n")
        .map((line) => line.split("\t").map((cell) => cell.trim()));

    // Filter columns
    const filterCol = (data: string[][], startIndex: number): string[][] =>
        data.map((row) => row.slice(startIndex, startIndex + 5));

    // Fetch a single sheet
    const fetchDocs = async (sheet_url: string): Promise<string[][]> => {
        const resp = await fetch(sheet_url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const text = await resp.text();
        return parseTSV(text);
    };

    // Main fetcher
    const fetchSheets = async () => {
        try {
        setLoading(true);
        setError(null);

        // translations
        const tResp = await fetch(TRANSLATION_URL);
        const tsv = await tResp.text();
        const parsedTranslations = parseTSV(tsv);
        setTranslations(parsedTranslations);

        // choose which country sheet to load
        let url = ALADIN_DATA_URL;
        if (country === 1) url = KYOBO_DATA_URL;
        else if (country === 2) url = THAIWAN_DATA_URL;
        else if (country === 3) url = AMAZON_DATA_URL;

        const parsedData = await fetchDocs(url);
        setData(parsedData);
        
        // choose slide column
        let startIndex = 0
        if (country === 1) startIndex = language * 5 + 2;
        else if (country === 2) startIndex = language * 5 + 2;
        else if (country === 3) startIndex = language * 5 + 2;

        const filtered = filterCol(parsedData, startIndex);
            setFilteredData(filtered);
        } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        } finally {
        setLoading(false);
        }
    };

    // load on mount + refetch when language/country changes
    useEffect(() => {
        fetchSheets();
    }, [country]);

    return (
        <LanguageContext.Provider
        value={{language, setLanguage, country, setCountry,
            translations,
            data, filteredData, loading, error, fetchSheets,
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