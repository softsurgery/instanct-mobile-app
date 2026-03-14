import { format } from "date-fns";
import React from "react";
import { Alert } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { StablePressable } from "~/components/shared/StablePressable";
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

  // JS function for alert
  const handleLongPress = () => {
    Alert.alert("Message Options", message || "", [
      { text: "Copy", onPress: () => console.log("Copy") },
      { text: "Delete", onPress: () => console.log("Delete") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Gesture
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={longPressGesture}>
        <Animated.View
          style={animatedStyle}
          className={cn(
            "max-w-[80%] mx-2 rounded-lg mt-2",
            right
              ? "self-end rounded-bl-xl rounded-br-none bg-primary"
              : "self-start rounded-br-xl rounded-bl-none bg-secondary",
          )}
        >
          <StablePressable
            className="p-2"
            onPressClassname="bg-muted/50"
            onPress={() => console.log("Pressed")}
          >
            <Text className="font-semibold pb-0.5">{message}</Text>
            <Text className="text-xs text-right">
              {format(timestamp, "hh:mm a")}
            </Text>
          </StablePressable>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};
