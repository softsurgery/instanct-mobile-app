import { Icon } from "@/components/ui/icon";
import { useRTL } from "@/hooks/useRTL";
import { NAV_THEME } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { Map, MessageCircle, Telescope, User } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isRTL = useRTL();
  const { t } = useTranslation("common");

  const isDarkColorScheme = colorScheme === "dark";

  const withHaptic = (onPress: Function) => {
    return async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    };
  };

  const VibratingTabButton = (props: any) => {
    const { onPress, children } = props;
    return (
      <Pressable
        className="flex flex-col justify-center items-center mt-2 gap-1"
        onPress={withHaptic(onPress)}
      >
        {children}
      </Pressable>
    );
  };

  const tabsConfig = [
    {
      name: "index",
      title: t("screens.explore"),
      icon: Telescope,
      iconSize: 30,
    },
    {
      name: "chat",
      title: t("screens.chat"),
      icon: MessageCircle,
      iconSize: 30,
    },

    {
      name: "map",
      title: t("screens.map"),
      icon: Map,
      iconSize: 30,
    },
    {
      name: "menu",
      title: t("screens.menu"),
      icon: User,
      iconSize: 30,
    },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkColorScheme
            ? NAV_THEME.dark.colors.card
            : NAV_THEME.light.colors.card,
          borderColor: "transparent",
        },
        sceneStyle: {
          flex: 1,
          backgroundColor: isDarkColorScheme
            ? NAV_THEME.dark.colors.card
            : NAV_THEME.light.colors.card,
        },
      }}
    >
      {(isRTL ? tabsConfig.reverse() : tabsConfig).map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: tab.icon
              ? ({ focused }) => (
                  <Icon
                    as={tab.icon}
                    size={tab.iconSize}
                    color={
                      focused
                        ? isDarkColorScheme
                          ? NAV_THEME.dark.colors.primary
                          : NAV_THEME.light.colors.primary
                        : isDarkColorScheme
                        ? NAV_THEME.dark.colors.text
                        : NAV_THEME.light.colors.text
                    }
                  />
                )
              : undefined,
            tabBarButton: VibratingTabButton,
            tabBarActiveTintColor: isDarkColorScheme
              ? NAV_THEME.dark.colors.primary
              : NAV_THEME.light.colors.primary,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "bold",
            },
          }}
        />
      ))}
    </Tabs>
  );
}
