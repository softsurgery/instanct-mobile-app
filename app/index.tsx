import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { cn } from "@/lib/utils";
import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import { router, SplashScreen } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Platform, View } from "react-native";

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

  return (
    <View className={cn("flex flex-col flex-1 items-center justify-center")}>
      <Button
        onPress={() => {
          router.navigate("/auth/sign-in");
        }}
      >
        <Text>Get Started</Text>
      </Button>
    </View>
  );
}
