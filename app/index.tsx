import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Platform } from "react-native";

export default function Page() {
  const { i18n } = useTranslation();
  const { setColorScheme } = useColorScheme();
  const preferencePersistStore = usePreferencePersistStore();

  const hasBootstrapped = React.useRef(false);

  React.useEffect(() => {
    if (!preferencePersistStore.isReady || hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    setTimeout(() => {
      setColorScheme(preferencePersistStore.theme);
      if (Platform.OS === "android")
        setAndroidNavigationBar(preferencePersistStore.theme);
      i18n.changeLanguage(preferencePersistStore.language);
      router.replace("/main");
    }, 100);
  }, [preferencePersistStore.isReady]);

  return <ActivityIndicator className="flex-1" size="large" />;
}
