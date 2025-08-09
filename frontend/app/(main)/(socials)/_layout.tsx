import { Stack } from "expo-router";
import { useColorScheme } from "~/lib/useColorScheme";

export const unstable_settings = {
  // this ensures it's not picked up as a tab
  href: null,
};

export default function SocialsLayout() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
