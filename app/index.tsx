import OnBoarding from "@/components/OnBoarding";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import { SplashScreen } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Platform } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function Page() {
  const { setColorScheme } = useColorScheme();
  const preferencePersistStore = usePreferencePersistStore();
  const isDarkMode = React.useMemo(
    () => preferencePersistStore.theme === "dark",
    [preferencePersistStore.theme]
  );
  React.useEffect(() => {
    if (preferencePersistStore.isReady) {
      // Set system color scheme
      setColorScheme(preferencePersistStore.theme);

      // Set Android navigation bar
      setAndroidNavigationBar(isDarkMode ? "light" : "dark");

      // Apply web background if on web
      if (Platform.OS === "web") {
        document.documentElement.classList.add("bg-background");
      }

      SplashScreen.hideAsync();
    }
  }, [preferencePersistStore.theme, preferencePersistStore.isReady]);

  return <OnBoarding />;
}
