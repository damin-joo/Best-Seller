import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import Home from "../(tabs)/index";
import { useLanguage } from "../context/Context";
import { GlobalStyles } from "../styles/global";

export default function Ranking() {
    const titles = ["종합 주간 베스트 20", "綜合每​​週最佳20名", "Top 20 hebdomadaire complet", "Comprehensive Weekly Best 20", "総合週間ベスト20"];
    const [languageTitle, setLanguageTitle] = useState("");
    const [showHome, setShowHome] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const { language, country, translations, filteredData, loading } = useLanguage();

    useEffect(() => {
        setLanguageTitle(titles[language] || "");
    }, [country]);

    if (loading) {
        return (
            <View style={GlobalStyles.container}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Loading Sheets...</Text>
            </View>
        );
    }

    if(showHome) {
        return <Home/>;
    }

    if(showDetails) {
        
    }
    
    return (
        <>
            <FlatList
                contentContainerStyle={GlobalStyles.container}
                ListHeaderComponent={
                    <Text style={GlobalStyles.title}>
                        {languageTitle} {translations.slice(1)[country][language]}
                    </Text>
                }
                data={filteredData}
                numColumns={2}           
                keyExtractor={(item, index) => index.toString()}
                columnWrapperStyle={GlobalStyles.row}
                renderItem={({ item, index }) => {
                    // item is an array of cells for the row; try to find the first URL for the image
                    const findImage = (cells: any[]) => {
                        for (const c of cells) {
                            if (typeof c === "string" && c.startsWith("http")) return c;
                        }
                        return undefined;
                    };

                    const findTitle = (cells: any[]) => {
                        for (const c of cells) {
                            if (typeof c === "string" && c && !c.startsWith("http")) return c;
                        }
                        return "";
                    };

                    const imageUri = findImage(item as any[]);
                    const titleText = findTitle(item as any[]);

                    return (
                        <TouchableOpacity style={GlobalStyles.book} onPress={() => setShowDetails(true)}>
                            
                            <Text style={{ fontWeight: "bold", fontSize: 20 }}>{index + 1}</Text>
                            <Image
                                source={imageUri ? { uri: imageUri } : undefined}
                                style={{ width: 80, height: 120, resizeMode: "cover", marginBottom: 6, borderRadius: 4 }}
                                accessibilityLabel={titleText}
                            />
                            <Text style={GlobalStyles.bookTitle}>{titleText || item[1]}</Text>
                        </TouchableOpacity>
                    );
                }}
            />
            <Button title="Back" onPress={() => setShowHome(true)}></Button>
        </>
        
    );
}