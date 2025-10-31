import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, FlatList, Text, TouchableOpacity, View } from "react-native";
import Home from "../(tabs)/index";
import { useLanguage } from "../context/Context";
import { GlobalStyles } from "../styles/global";

export default function Ranking() {
    const titles = ["종합 주간 베스트 30", "Weekly Best 30", "일본말 30"];
    const [languageTitle, setLanguageTitle] = useState("");
    const [showHome, setShowHome] = useState(false);
    const { language, country, translations, filteredData, loading, fetchSheets } = useLanguage();

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
    
    return (
        <>
            <FlatList
                contentContainerStyle={GlobalStyles.container} // replaces ScrollView
                ListHeaderComponent={
                    <Text style={GlobalStyles.title}>
                        {languageTitle} {translations.slice(1)[country][language]}
                    </Text>
                }
                data={filteredData.slice(1)} // skip header row
                numColumns={3}               // 3 books per row
                keyExtractor={(item, index) => index.toString()}
                columnWrapperStyle={GlobalStyles.row} // spacing between rows
                renderItem={({ item, index }) => (
                    <TouchableOpacity style={GlobalStyles.book} onPress={() => console.log(item[0])}>
                        <Text style={{ fontWeight: "bold", fontSize: 20 }}>{index + 1}</Text>
                        <Text style={GlobalStyles.bookTitle}>{item[1]}</Text>
                    </TouchableOpacity>
                )}
            />
            <Button title="Back" onPress={() => setShowHome(true)}></Button>
        </>
        
    );
}