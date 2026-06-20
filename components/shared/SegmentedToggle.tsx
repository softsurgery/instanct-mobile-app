import React from "react";
import { Pressable, View, LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Text } from "../ui/text";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  disabled,
  className,
}: SegmentedToggleProps<T>) {
  const [trackWidth, setTrackWidth] = React.useState(0);

  const onLayout = (e: LayoutChangeEvent) =>
    setTrackWidth(e.nativeEvent.layout.width);

  const count = options.length;
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  // track has p-1 (4px) on each side → inner width split across all options
  const segmentWidth = trackWidth > 0 ? (trackWidth - 8) / count : 0;

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [
      {
        translateX: withTiming(segmentWidth * activeIndex, {
          duration: 220,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
  }));

  return (
    <View
      onLayout={onLayout}
      className={cn(
        "flex-row rounded-xl bg-muted/50 p-1",
        disabled && "opacity-50",
        className,
      )}
      pointerEvents={disabled ? "none" : "auto"}
    >
      {segmentWidth > 0 && (
        <Animated.View
          style={indicatorStyle}
          className="absolute bottom-1 left-1 top-1 rounded-lg bg-primary shadow-sm"
        />
      )}
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className="z-10 flex-1 flex-row items-center justify-center gap-2 rounded-lg px-4 py-2.5"
          >
            <Text
              className={cn(
                "text-sm font-semibold",
                active ? "text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
