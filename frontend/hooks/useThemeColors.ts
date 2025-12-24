// hooks/useThemeColors.ts
import { useColorScheme } from "react-native";

export const useThemeColors = () => {
  const scheme = useColorScheme();

  return {
    foreground: scheme === "dark" ? "#ffffff" : "#000000",
    muted: scheme === "dark" ? "#a1a1aa" : "#6b7280",
    background: scheme === "dark" ? "#000000" : "#ffffff",
  };
};
