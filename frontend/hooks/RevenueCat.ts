import { Platform } from "react-native";
import { useEffect } from "react";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

const revenueCatApi = process.env.EXPO_PUBLIC_REVENUE_CAT_API;

export default function useRevenueCat() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    // Platform-specific API keys
    const iosApiKey = revenueCatApi;
    const androidApiKey = revenueCatApi;

    if (Platform.OS === "ios" && iosApiKey) {
      Purchases.configure({ apiKey: iosApiKey });
    } else if (Platform.OS === "android" && androidApiKey) {
      Purchases.configure({ apiKey: androidApiKey });
    }
  }, []);
}
