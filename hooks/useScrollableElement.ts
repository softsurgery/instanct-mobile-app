import React from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface UseScrollableElementProps {
  duration?: number; // Duration for the animation in milliseconds
  deltaThreshold?: number; // Minimum scroll delta to trigger header visibility change
}

export const useScrollableElement = ({
  duration = 250,
  deltaThreshold = 10,
}: UseScrollableElementProps) => {
  const showHeader = useSharedValue(true);

  // Memoized header visibility handler
  const handleHeaderVisibility = React.useCallback(
    (visible: boolean) => {
      showHeader.value = visible;
    },
    [showHeader],
  );

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(showHeader.value ? 0 : -deltaThreshold, {
          duration,
        }),
      },
    ],
    opacity: withTiming(showHeader.value ? 1 : 0, { duration }),
    height: withTiming(showHeader.value ? deltaThreshold : 0, {
      duration,
    }),
  }));

  // Track scroll direction
  const lastOffsetY = React.useRef(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffsetY = e.nativeEvent.contentOffset.y;

    const delta = currentOffsetY - lastOffsetY.current;
    if (currentOffsetY <= 0) {
      handleHeaderVisibility(true);
    } else if (delta < -10) {
      handleHeaderVisibility(true); // scrolling up
    } else if (delta > 0) {
      handleHeaderVisibility(false); // scrolling down
    }

    lastOffsetY.current = currentOffsetY;
  };

  return {
    animatedHeaderStyle,
    handleScroll,
  };
};
