import { NAV_THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React from "react";
import { View } from "react-native";
import "../global.css";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [ready, setReady] = React.useState(false);

  const isDarkColorScheme = colorScheme === "dark";

  // Wait for navigation context to load
  const navigationState = useRootNavigationState();
  React.useEffect(() => {
    if (navigationState) {
      setReady(true);
    }
  }, [navigationState]);

  if (!ready) return null;
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} translucent />
      <View className={cn("flex-1", colorScheme)}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              flex: 1,
              backgroundColor: isDarkColorScheme
                ? NAV_THEME.dark.colors.background
                : NAV_THEME.light.colors.background,
            },
            headerStyle: {
              backgroundColor: isDarkColorScheme
                ? NAV_THEME.dark.colors.card
                : NAV_THEME.light.colors.card,
            },
            headerTintColor: isDarkColorScheme
              ? NAV_THEME.dark.colors.text
              : NAV_THEME.light.colors.text,
            headerTitleStyle: {
              fontSize: 20,
              color: isDarkColorScheme
                ? NAV_THEME.dark.colors.text
                : NAV_THEME.light.colors.text,
            },
          }}
        />
        <PortalHost />
      </View>
    </ThemeProvider>
  );
}
