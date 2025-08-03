import { Stack } from "expo-router";
import { useColorScheme } from "~/lib/useColorScheme";

export default function SocialsLayout() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: isDarkColorScheme ? "#1c1c1e" : "#ffffff",
        },
        headerTintColor: isDarkColorScheme ? "#ffffff" : "#007AFF",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    />
  );
}
