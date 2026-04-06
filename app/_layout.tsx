import { NotificationContext } from "@/contexts/NotificationsContext";
import { useNotifications } from "@/hooks/content/notification/useNotifications";
import { NAV_THEME, THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import "../i18n";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const queryClient = new QueryClient();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { newCount, notifications, resetCount } = useNotifications();

  const isDarkColorScheme = colorScheme === "dark";

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NotificationContext.Provider
            value={{ newCount, notifications, resetCount }}
          >
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
                      backgroundColor: isDarkColorScheme
                        ? NAV_THEME.dark.colors.background
                        : NAV_THEME.light.colors.background,
                    },
                    keyboardHandlingEnabled: true,
                    headerStyle: {
                      backgroundColor: isDarkColorScheme
                        ? NAV_THEME.dark.colors.background
                        : NAV_THEME.light.colors.background,
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
                <Toaster
                  style={{
                    backgroundColor: isDarkColorScheme
                      ? THEME.dark.background
                      : THEME.light.background,
                  }}
                />
                <PortalHost />
              </View>
            </GestureHandlerRootView>
          </NotificationContext.Provider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
