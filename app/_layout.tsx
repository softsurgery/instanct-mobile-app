import { NAV_THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import "../i18n";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import { useColorPalette } from "@/hooks/useColorPalette";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { colorScheme, palette } = useColorPalette();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View className={cn("flex-1 light dark:dark")}>
              <StatusBar
                style={colorScheme === "dark" ? "light" : "dark"}
                translucent
              />
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
            </View>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
