import "~/global.css";

import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { Redirect, Slot, Stack, useRouter } from "expo-router";
import { Appearance, Platform, View } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "~/redux/rootReducer";
import useAuthListener from "~/hooks/useAuthListener";
import Toast from "~/components/Toast";
import { useDailyReading } from "~/hooks/useDailyReading";
import { useDateChange } from "~/hooks/useDateChange";
import { RestartAlert } from "~/components/RestartAlert";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import useRevenueCat from "~/hooks/RevenueCat";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

const usePlatformSpecificSetup = Platform.select({
  web: useSetWebBackgroundClassName,
  android: useSetAndroidNavigationBar,
  default: noop,
});

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  fade: true,
});
const RootLayout = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const { isDarkColorScheme } = useColorScheme();
  const isAuthLoaded = useAuthListener();

  // Load today's chapter data during splash screen
  const { dailyReading, loading: dailyReadingLoading } = useDailyReading();

  // Monitor for date changes and show restart alert
  const { showRestartAlert, dismissAlert } = useDateChange();

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for today's chapter to load
        console.log("📚 Loading today's chapter data...");

        // Wait until daily reading is loaded or we have an error
        while (dailyReadingLoading) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        useRevenueCat();

        console.log(
          "✅ Today's chapter loaded:",
          dailyReading?.bookName,
          dailyReading?.chapterNumber
        );

        // Small delay for smooth splash screen experience
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        console.log("app is ready, hide splash screen");
      }
    }

    prepare();
  }, [dailyReadingLoading, dailyReading]);

  //Revenue Cat
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: "appl_eWtgNGBVWjHVqbtSktECItMeJQg" });
      // } else if (Platform.OS === 'android') {
      //    Purchases.configure({apiKey: <revenuecat_project_google_api_key>});
    }
    getCustomerInfo();
    getOfferings();
  }, []);

  async function getCustomerInfo() {
    const customerInfo = await Purchases.getCustomerInfo();
    console.log("customer Info", JSON.stringify(customerInfo, null, 2));
  }

  async function getOfferings() {
    const offerings = await Purchases.getOfferings();
    if (
      offerings.current !== null &&
      offerings.current.availablePackages.length !== 0
    )
      console.log("get offerings", JSON.stringify(offerings, null, 2));
  }

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      //Splash Screen doesn't hide until screen renders
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    // TODO make it togglable in the future
    // <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
    <ThemeProvider value={LIGHT_THEME}>
      <View
        className="flex-1 h-full w-full bg-background"
        onLayout={onLayoutRootView}
      >
        <Toast />
        <RestartAlert visible={showRestartAlert} onDismiss={dismissAlert} />
        <RootLayoutNav isAuthLoaded={isAuthLoaded} />
        <PortalHost />
      </View>
    </ThemeProvider>
  );
};
function RootLayoutNav({ isAuthLoaded }: { isAuthLoaded: boolean }) {
  const router = useRouter();
  usePlatformSpecificSetup();

  const user = useSelector((state: RootState) => state.user);

  // Route decision
  useEffect(() => {
    if (isAuthLoaded) {
      if (!user.isLoggedIn) {
        console.log("route to sign in");
        router.replace("/(auth)/signIn");
      } else if (!user.finishedOnboarding) {
        console.log(
          "route to onboarding - first time or incomplete onboarding"
        );
        router.replace("/(on-boarding)/step-1-name");
      } else {
        console.log("route to main app");
        router.replace("/(main)/(bottomTabs)/home");
      }
    }
  }, [isAuthLoaded, user.isLoggedIn, user.finishedOnboarding, router]);

  return <>{isAuthLoaded ? <Slot /> : null}</>;
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? useEffect
    : useLayoutEffect;

function useSetWebBackgroundClassName() {
  useIsomorphicLayoutEffect(() => {
    // Adds the background color to the html element to prevent white background on overscroll.
    document.documentElement.classList.add("bg-background");
  }, []);
}

function useSetAndroidNavigationBar() {
  useLayoutEffect(() => {
    setAndroidNavigationBar(Appearance.getColorScheme() ?? "light");
  }, []);
}

function noop() {}

export default RootLayout;
