import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, FlatList, Text, TouchableOpacity, View } from "react-native";
import Home from "../(tabs)/index";
import { useLanguage } from "../context/Context";
import { GlobalStyles } from "../styles/global";

export default function Ranking() {
    const titles = ["종합 주간 베스트 20", "Weekly Best 20", "Japanese Books Top 20", "Taiwanese Books Top 20", "Francais Books Top 20"];
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
                data={filteredData.slice(1)}
                numColumns={2}           
                keyExtractor={(item, index) => index.toString()}
                columnWrapperStyle={GlobalStyles.row}
                renderItem={({ item, index }) => (
                    <TouchableOpacity style={GlobalStyles.book} onPress={() => setShowDetails(true)}>
                        <img src="" alt="" />
                        <Text style={{ fontWeight: "bold", fontSize: 20 }}>{index + 1}</Text>
                        <Text style={GlobalStyles.bookTitle}>{item[1]}</Text>
                    </TouchableOpacity>
                )}
            />
            <Button title="Back" onPress={() => setShowHome(true)}></Button>
        </>
        
    );
}