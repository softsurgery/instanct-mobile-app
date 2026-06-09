import React from "react";
import { Pressable, View, LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Text } from "../ui/text";
import { cn } from "@/lib/utils";
import { SessionStore } from "@/stores/useSessionStore";

interface SessionStartModeToggleProps {
  store: SessionStore;
  disabled?: boolean;
}

export const SessionStartModeToggle = ({
  store,
  disabled,
}: SessionStartModeToggleProps) => {
  const [trackWidth, setTrackWidth] = React.useState(0);
  const startNow = store.flags.startNow;

  const onLayout = (e: LayoutChangeEvent) =>
    setTrackWidth(e.nativeEvent.layout.width);

  // track has p-1 (4px) on each side → indicator fills half the inner width
  const pillWidth = trackWidth > 0 ? (trackWidth - 8) / 2 : 0;

  const indicatorStyle = useAnimatedStyle(() => ({
    width: pillWidth,
    transform: [
      {
        translateX: withTiming(startNow ? 0 : pillWidth, {
          duration: 220,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
  }));

  const options = [
    {
      label: "Démarrer maintenant",
      active: startNow,
      onPress: () => {
        store.setNested("flags.startNow", true);
        store.setNested("createDto.plannedStart", undefined);
      },
    },
    {
      label: "Planifier",
      active: !startNow,
      onPress: () => store.setNested("flags.startNow", false),
    },
  ];

  return (
    <View
      onLayout={onLayout}
      className={cn("-mt-4 mb-2 flex-row p-2", disabled && "opacity-50")}
      pointerEvents={disabled ? "none" : "auto"}
    >
      {pillWidth > 0 && (
        <Animated.View
          style={indicatorStyle}
          className="absolute bottom-1 left-1 top-1 rounded-lg bg-primary shadow-sm"
        />
      )}
      {options.map(({ label, active, onPress }) => (
        <Pressable
          key={label}
          onPress={onPress}
          className="z-10 flex-1 flex-row items-center justify-center gap-2 rounded-lg px-4 py-2.5"
        >
          <Text
            className={cn(
              "text-sm font-semibold",
              active ? "text-secondary-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
