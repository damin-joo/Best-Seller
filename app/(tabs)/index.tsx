import { useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";
import Ranking from "../components/ranking";
import { useLanguage } from "../context/Context";
import { GlobalStyles } from "../styles/global";

export default function Index() {
  const [showRanking, setShowRanking] = useState(false);
  const { language, setCountry, translations, data, filteredData, loading, fetchSheets} = useLanguage();

  if (loading) {
    return (
      <View style={GlobalStyles.container}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading Sheets...</Text>
      </View>
    );
  }

  if(showRanking) {
    return <Ranking/>;
  }

  const filterCol = (data: string[][], countryIndex: number): string[][] =>
    data.map((row) => row.slice(countryIndex * 5 + 1, countryIndex * 5 + 6));


  return (
    <View style={GlobalStyles.container}>
      <Text style={GlobalStyles.title}>Best Seller App!</Text>

      <Text>Select a Country</Text>
      {translations.slice(1).map((row, i) => (
          <Button 
              key={i}
              title={row[language]}
              onPress={() => { 
                setCountry(i);
                setShowRanking(true);
              }}
          />
      ))}
    </View>
  );
}

