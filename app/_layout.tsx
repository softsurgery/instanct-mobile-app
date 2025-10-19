import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import React from "react";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Auth */}
        <Stack.Screen name="index" options={{}} />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}
