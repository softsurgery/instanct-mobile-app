import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import { router, SplashScreen } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Platform } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function Page() {
  const { i18n } = useTranslation();
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
      i18n.changeLanguage(preferencePersistStore.language);

      // Set Android navigation bar
      setAndroidNavigationBar(isDarkMode ? "light" : "dark");

      // Apply web background if on web
      if (Platform.OS === "web") {
        document.documentElement.classList.add("bg-background");
      }

      SplashScreen.hideAsync();
      router.replace("/main");
    }
  }, [preferencePersistStore.theme, preferencePersistStore.isReady]);

  return <ActivityIndicator className="flex-1" size="large" />;
}
