import React from "react";
import { cn } from "@/lib/utils";
import { useColorPalette } from "@/hooks/useColorPalette";
import { hslToHex } from "@/lib/theme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Icon } from "../ui/icon";

interface MapLockedOverlayProps {
  className?: string;
  onStartSession?: () => void;
  blurRadius?: number;
}

/** A single sonar ring that expands and fades, forever. */
const RadarRing = ({ delay, color }: { delay: number; color: string }) => {
  const p = useSharedValue(0);

  React.useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 2800,
          easing: Easing.out(Easing.ease),
        }),
        -1,
        false,
      ),
    );
  }, [delay, p]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.55 + p.value * 1.25 }],
    opacity: (1 - p.value) * 0.25,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        { borderRadius: 999, borderWidth: 1.5, borderColor: color },
        style,
      ]}
    />
  );
};

/** Staggered fade + rise on mount. */
const useReveal = (delay: number) => {
  const v = useSharedValue(0);
  React.useEffect(() => {
    v.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
  }, [delay, v]);
  return useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: (1 - v.value) * 14 }],
  }));
};

export const MapLockedOverlay = ({
  className,
  blurRadius = 5,
}: MapLockedOverlayProps) => {
  const { t } = useTranslation("common");
  const { palette, colorScheme } = useColorPalette();

  const bg = hslToHex(palette.background);
  const primary = hslToHex(palette.primary);

  // staggered entrance
  const iconReveal = useReveal(0);
  const textReveal = useReveal(140);

  // soft glow behind the lock
  const glow = useSharedValue(0);
  React.useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [glow]);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + glow.value * 0.4,
    transform: [{ scale: 1 + glow.value * 0.12 }],
  }));

  return (
    <View className={cn("flex-1 overflow-hidden bg-muted", className)}>
      <Image
        source={require("@/assets/images/map-lock.jpg")}
        resizeMode="cover"
        blurRadius={blurRadius}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Frost + scrim + bottom atmosphere */}
      <BlurView
        intensity={colorScheme === "dark" ? 24 : 36}
        tint={colorScheme === "dark" ? "dark" : "light"}
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFillObject}
      />
      <View className="absolute inset-0 bg-background/25" />
      <LinearGradient
        colors={[`${bg}00`, `${bg}99`]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Content */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-full max-w-sm items-center">
          {/* Radar + lock */}
          <Animated.View
            style={iconReveal}
            className="mb-8 h-32 w-32 items-center justify-center"
          >
            <RadarRing delay={0} color={primary} />
            <RadarRing delay={950} color={primary} />
            <RadarRing delay={1900} color={primary} />

            <Animated.View
              pointerEvents="none"
              style={[glowStyle, { position: "absolute", top: 16, left: 16 }]}
              className="h-24 w-24"
            />

            <View className="h-16 w-16 items-center justify-center">
              <Icon as={MapPin} size={32} />
            </View>
          </Animated.View>

          {/* Copy */}
          <Animated.View style={textReveal} className="items-center">
            <Text className="text-center text-2xl font-bold tracking-tight text-foreground">
              {t("map.locked.title", "Sharing is locked")}
            </Text>
            <Text className="mt-2.5 text-center text-sm leading-5 text-muted-foreground">
              {t(
                "map.locked.description",
                "Start a session to go live and see who's nearby on the map.",
              )}
            </Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};
