import { format } from "date-fns";
import React from "react";
import { Alert, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

interface ChatBubbleProps {
  message?: string;
  timestamp: Date;
  right?: boolean;
  isPending?: boolean;
}

export const ChatBubble = ({
  message,
  timestamp,
  right,
  isPending,
}: ChatBubbleProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLongPress = () => {
    Alert.alert("Message Options", message || "", [
      { text: "Copy", onPress: () => console.log("Copy") },
      { text: "Delete", onPress: () => console.log("Delete") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const longPressGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      scale.value = withSpring(1.05);
    })
    .onEnd((e, success) => {
      scale.value = withSpring(1);
      if (success) {
        runOnJS(handleLongPress)();
      }
    });

  return (
    <GestureDetector gesture={longPressGesture}>
      <Animated.View
        style={[animatedStyle, isPending && { opacity: 0.5 }]}
        className={cn(
          "max-w-[80%] mx-3 rounded-2xl mt-1.5",
          right
            ? "self-end rounded-br-sm bg-primary"
            : "self-start rounded-bl-sm bg-secondary",
        )}
      >
        <Pressable className="px-3 py-2 active:opacity-80">
          <Text
            className={cn(
              "text-[15px] leading-5",
              right ? "text-primary-foreground" : "text-secondary-foreground",
            )}
          >
            {message}
          </Text>
          <Text
            className={cn(
              "text-[10px] text-right mt-1",
              right
                ? "text-primary-foreground/70"
                : "text-secondary-foreground/60",
            )}
          >
            {format(timestamp, "hh:mm a")}
          </Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};
