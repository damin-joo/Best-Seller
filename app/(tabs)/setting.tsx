import React from "react";
import { ActivityIndicator, Button, ScrollView, Text, View } from "react-native";
import { useLanguage } from "../context/Context";
import { GlobalStyles } from "../styles/global";

export default function Settings() {
    const { setLanguage, loading, translations } = useLanguage();

    if (loading) {
        return (
        <View style={GlobalStyles.container}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text>Loading Sheets...</Text>
        </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={GlobalStyles.container}>
            {/* Language Settings */}
            <Text style={GlobalStyles.title}>Languages</Text>
            <View>
                {translations[0].map((col, i) => (
                <Button
                    key={i}
                    title={col}
                    onPress={() => setLanguage(i)}
                />
                ))}
            </View>

            <Text style={GlobalStyles.title}> </Text>
            <Button title="Re-Crawl"></Button>

        </ScrollView>
    );
}
