import { Icon } from "@/components/ui/icon";
import { useColorPalette } from "@/hooks/useColorPalette";
import { useRTL } from "@/hooks/useRTL";
import { IconChecklist, IconMapPinHeart } from "@tabler/icons-react-native";
import * as Haptics from "expo-haptics";
import { Tabs, useSegments } from "expo-router";
import { Telescope, User } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export default function TabLayout() {
  const { palette } = useColorPalette();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const isMapScreen = currentRoute === "map";

  const isRTL = useRTL();
  const { t } = useTranslation("common");

  const tabsConfig = React.useMemo(
    () => [
      {
        name: "index",
        title: t("screens.explore"),
        icon: Telescope,
      },
      {
        name: "activities",
        title: t("screens.activities", "Activities"),
        icon: IconChecklist,
      },
      {
        name: "map",
        title: t("screens.map"),
        icon: IconMapPinHeart,
      },
      {
        name: "menu",
        title: t("screens.menu"),
        icon: User,
      },
    ],
    [t],
  );

  const orderedTabs = isRTL ? [...tabsConfig].reverse() : tabsConfig;

  const VibratingTabButton = ({
    accessibilityState,
    children,
    onPress,
  }: any) => {
    const focused = accessibilityState?.selected;
    const scale = useSharedValue(focused ? 1 : 0);

    React.useEffect(() => {
      scale.value = withSpring(focused ? 1 : 0, {
        damping: 15,
        stiffness: 140,
      });
    }, [focused]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: interpolate(scale.value, [0, 1], [1, 1.08]),
        },
      ],
    }));

    const indicatorStyle = useAnimatedStyle(() => ({
      opacity: scale.value,
      transform: [
        {
          scaleX: withSpring(focused ? 1 : 0.4),
        },
      ],
    }));

    const handlePress = async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress?.();
    };

    return (
      <Pressable onPress={handlePress} className="mt-2">
        <Animated.View
          style={animatedStyle}
          className="items-center justify-center gap-1"
        >
          {children}

          <Animated.View
            style={indicatorStyle}
            className="mt-1 h-1 w-8 rounded-full"
          >
            <View
              style={{ backgroundColor: palette.primary }}
              className="h-full w-full rounded-full"
            />
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          flex: 1,
          backgroundColor: "transparent",
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.foreground,
        tabBarStyle: {
          borderTopEndRadius: !isMapScreen ? 28 : 0,
          borderTopStartRadius: !isMapScreen ? 28 : 0,
          paddingTop: 10,
          paddingInline: 10,
          backgroundColor: palette.card,
          borderColor: palette.border,
          borderTopWidth: 0,
          height: "9%",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      {orderedTabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarButton: (props) => <VibratingTabButton {...props} />,
            tabBarIcon: ({ color, focused }) => (
              <Icon as={tab.icon} size={focused ? 28 : 24} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
