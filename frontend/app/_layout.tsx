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
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/rootReducer";
import useAuthListener from "~/hooks/useAuthListener";
import Toast from "~/components/Toast";

Amplify.configure(outputs);

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
  duration: 1000,
  fade: true,
});
export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { isDarkColorScheme } = useColorScheme();
  const isAuthLoaded = useAuthListener();

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        // Artificially delay for two seconds to simulate a slow loading experience
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        console.log("app is ready, hide splash screen");
      }
    }

    prepare();
  }, []);

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
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <View
        className="flex-1 h-full w-full bg-background"
        onLayout={onLayoutRootView}
      >
        <Toast />
        <RootLayoutNav isAuthLoaded={isAuthLoaded} />
        <PortalHost />
      </View>
    </ThemeProvider>
  );
}
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
      } else {
        console.log("route to home");
        router.replace("/(on-boarding)/step-1-name");
      }
    }
  }, [isAuthLoaded, user.isLoggedIn, router]);

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
