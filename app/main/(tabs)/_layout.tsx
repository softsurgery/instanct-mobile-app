import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useRTL } from "@/hooks/useRTL";
import { NAV_THEME } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { Map, Menu, MessageCircle, Plus, Telescope } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";

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
      <Button
        variant={"link"}
        className="flex-1 items-center justify-center mt-2"
        onPress={withHaptic(onPress)}
      >
        {children}
      </Button>
    );
  };

  const tabsConfig = [
    {
      name: "index",
      title: t("screens.explore"),
      icon: Telescope,
      iconSize: 34,
    },
    {
      name: "chat",
      title: t("screens.chat"),
      icon: MessageCircle,
      iconSize: 34,
    },
    {
      name: "add_job",
      customButton: (props: any) => {
        const { onPress } = props;
        return (
          <Button
            variant="default"
            className="w-16 h-16 -top-4 rounded-full flex items-center justify-center shadow-lg mx-auto"
            onPress={withHaptic(onPress)}
          >
            <Icon as={Plus} size={32} className="text-white" />
          </Button>
        );
      },
      hideLabel: true,
    },
    {
      name: "map",
      title: t("screens.map"),
      icon: Map,
      iconSize: 34,
    },
    {
      name: "menu",
      title: t("screens.menu"),
      icon: Menu,
      iconSize: 34,
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
            ? NAV_THEME.dark.colors.background
            : NAV_THEME.light.colors.background,
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
            tabBarButton: tab.customButton || VibratingTabButton,
            tabBarLabel: tab.hideLabel ? () => null : undefined,
            tabBarActiveTintColor: isDarkColorScheme
              ? NAV_THEME.dark.colors.primary
              : NAV_THEME.light.colors.primary,
            tabBarLabelStyle: {
              fontSize: 11,
              marginTop: 4,
            },
          }}
        />
      ))}
    </Tabs>
  );
}
