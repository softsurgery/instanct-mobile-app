import { NotificationContext } from "@/contexts/NotificationsContext";
import { useLiveGeolocation } from "@/hooks/content/geolocation/useLiveGeolocation";
import { useNotifications } from "@/hooks/content/notification/useNotifications";
import { NAV_THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toastable from "react-native-toastable";
import "../global.css";
import "../i18n";

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
  useLiveGeolocation({
    updateInterval: 5,
    radiusKm: 4,
  });
  const [ready, setReady] = React.useState(false);

  const isDarkColorScheme = colorScheme === "dark";

  const navigationState = useRootNavigationState();
  React.useEffect(() => {
    if (navigationState) {
      setReady(true);
    }
  }, [navigationState]);

  if (!ready) return null;
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NotificationContext.Provider
            value={{ newCount, notifications, resetCount }}
          >
            <Toastable position="top" />
            <StatusBar
              style={isDarkColorScheme ? "light" : "dark"}
              translucent
            />
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
          </NotificationContext.Provider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
