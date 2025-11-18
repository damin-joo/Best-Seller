import { Stack } from "expo-router";
import "react-native-reanimated";
import { LanguageProvider } from "./context/Context";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </LanguageProvider>
  );
}