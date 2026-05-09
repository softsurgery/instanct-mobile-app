import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { ScrollViewContext } from "@/contexts/ScrollViewContext";
import { cn } from "@/lib/utils";
import { Clock, ChevronDown } from "lucide-react-native";
import React from "react";
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  UIManager,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { StablePressable } from "../StablePressable";
import { StableScrollable } from "../StableScrollable";
import { Separator } from "@/components/ui/separator";
import * as Haptics from "expo-haptics";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TimePickerProps {
  className?: string;
  classNames?: {
    trigger: string;
    content: string;
  };
  value?: Date | null;
  onTimeChange: (date: Date | null) => void;
  disabled?: boolean;
  nullable?: boolean;
}

const HOURS = Array.from({ length: 12 }, (_, i) => {
  const h = i + 1;
  return { label: String(h), value: String(h) };
});

const MINUTES = Array.from({ length: 60 }, (_, i) => ({
  label: String(i).padStart(2, "0"),
  value: String(i),
}));

const PERIODS = [
  { label: "AM", value: "AM" },
  { label: "PM", value: "PM" },
];

function formatTime(date: Date): string {
  let hours = date?.getHours();
  const minutes = date?.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export const TimePicker = ({
  className,
  classNames,
  disabled,
  value: time = null,
  onTimeChange,
  nullable = true,
}: TimePickerProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const rotation = useSharedValue(0);
  const { scrollToView } = React.useContext(ScrollViewContext);
  const contentRef = React.useRef<View>(null);

  const toggle = () => {
    if (disabled) return;
    Keyboard.dismiss();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = !expanded;
    setExpanded(next);
    rotation.value = withTiming(next ? 180 : 0, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    });
    if (!time) onTimeChange(new Date());
    if (next) {
      setTimeout(() => {
        scrollToView(contentRef);
      }, 350);
    }
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const displayText = React.useMemo(
    () => (time ? formatTime(time) : "Select a time"),
    [time],
  );

  const getInitialHour = () => {
    if (!time) return "12";
    const h = time.getHours() % 12 || 12;
    return String(h);
  };

  const getInitialMinute = () => {
    if (!time) return "0";
    return String(time.getMinutes());
  };

  const getInitialPeriod = () => {
    if (!time) return "AM";
    return time.getHours() >= 12 ? "PM" : "AM";
  };

  const [hour, setHour] = React.useState(getInitialHour);
  const [minute, setMinute] = React.useState(getInitialMinute);
  const [period, setPeriod] = React.useState(getInitialPeriod);

  const handleTimeChange = (
    key: "hour" | "minute" | "period",
    value: string,
  ) => {
    let newHour = hour;
    let newMinute = minute;
    let newPeriod = period;

    switch (key) {
      case "hour":
        newHour = value;
        break;
      case "minute":
        newMinute = value;
        break;
      case "period":
        newPeriod = value;
        break;
    }

    setHour(newHour);
    setMinute(newMinute);
    setPeriod(newPeriod);

    if (onTimeChange) {
      let hours24 = Number(newHour) % 12;
      if (newPeriod === "PM") hours24 += 12;

      const base = time ? new Date(time) : new Date();
      base.setHours(hours24, Number(newMinute), 0, 0);
      onTimeChange(base);
    }
  };

  const clearTime = () => {
    onTimeChange(null);
  };

  return (
    <View className={cn("w-full", className)}>
      {/* Trigger */}
      <Button
        disabled={disabled}
        variant="outline"
        className={cn("w-full h-9 p-0 px-2", classNames?.trigger)}
        onPress={toggle}
      >
        <View className="flex flex-row items-center justify-between w-full">
          <View className="flex flex-row items-center gap-2">
            <Icon as={Clock} size={16} color={"gray"} />
            <Text className="text-sm">{displayText}</Text>
          </View>
          <Animated.View style={chevronStyle}>
            <Icon as={ChevronDown} size={16} color={"gray"} />
          </Animated.View>
        </View>
      </Button>

      {/* Accordion content */}
      {expanded && (
        <View
          ref={contentRef}
          className={cn(
            "mt-2 rounded-lg border border-border bg-card p-3",
            classNames?.content,
          )}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
        >
          <View className="flex-row items-center justify-center gap-4">
            <StableScrollable
              options={HOURS}
              value={hour}
              onChange={(opt) => handleTimeChange("hour", opt.value)}
              className="flex-1 h-12 bg-card rounded-lg"
            />
            <StableScrollable
              options={MINUTES}
              value={minute}
              onChange={(opt) => handleTimeChange("minute", opt.value)}
              className="flex-1 h-12 bg-card rounded-lg"
            />
            <StableScrollable
              options={PERIODS}
              value={period}
              onChange={(opt) => handleTimeChange("period", opt.value)}
              className="flex-1 h-12 bg-card rounded-lg"
            />
          </View>
          <Separator className="my-2" />
          <View className="flex-row justify-between">
            <StablePressable
              className="p-2 rounded-lg"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setExpanded(false);
                clearTime();
              }}
            >
              <Text className="font-bold">Remove Time</Text>
            </StablePressable>
            <StablePressable
              className="p-2 rounded-lg"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setExpanded(false);
              }}
            >
              <Text className="text-primary font-bold">Done</Text>
            </StablePressable>
          </View>
        </View>
      )}
    </View>
  );
};
