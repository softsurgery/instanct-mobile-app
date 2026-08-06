import { splashPrevented } from "@/lib/splash-screen";
import { NAV_THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "../global.css";
import "../i18n";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import { useColorPalette } from "@/hooks/useColorPalette";
import { asyncStoragePersister, queryClient } from "@/lib/queryClient";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { VideoThumbnailGeneratorHost } from "@/components/shared/VideoThumbnailGeneratorHost";
import { LoaderProvider } from "@/contexts/LoaderContext";
import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";

function RootLayoutContent() {
  const { colorScheme, palette } = useColorPalette();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          className={cn("flex-1 light dark:dark bg-background")}
          style={{ paddingBottom: Platform.OS === "ios" ? 0 : insets.bottom }}
        >
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                flex: 1,
                backgroundColor: palette.background,
              },
              keyboardHandlingEnabled: true,
              headerStyle: {
                backgroundColor: palette.background,
              },
              headerTintColor: palette.foreground,
              headerTitleStyle: {
                fontSize: 20,
                color: palette.foreground,
              },
            }}
          />
          <Toaster
            duration={1000}
            style={{
              backgroundColor: palette.card,
            }}
          />
          <PortalHost />
          <VideoThumbnailGeneratorHost />
        </View>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
}

export default function RootLayout() {
  const { colorScheme } = useColorPalette();
  const isPreferenceReady = usePreferencePersistStore((state) => state.isReady);

  React.useEffect(() => {
    if (!isPreferenceReady) return;

    void (async () => {
      try {
        await splashPrevented;
        await SplashScreen.hideAsync();
      } catch {
        // Splash may already be hidden (e.g. dev fast refresh).
      }
    })();
  }, [isPreferenceReady]);

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          maxAge: 1000 * 60 * 60 * 24,
        }}
      >
        <SafeAreaProvider>
          <LoaderProvider>
            <RootLayoutContent />
          </LoaderProvider>
        </SafeAreaProvider>
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
}
