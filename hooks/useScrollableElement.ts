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
  checkScrollable?: boolean; // Flag to only activate event if content is scrollable
  collapseHeight?: boolean; // Collapse layout height when header is hidden
}

export const useScrollableElement = ({
  duration = 250,
  deltaThreshold = 10,
  checkScrollable = false,
  collapseHeight = true,
}: UseScrollableElementProps) => {
  const showHeader = useSharedValue(true);

  const handleHeaderVisibility = (visible: boolean) => {
    showHeader.value = visible;
  };

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const style: {
      transform: { translateY: number }[];
      opacity: number;
      height?: number;
    } = {
      transform: [
        {
          translateY: withTiming(showHeader.value ? 0 : -deltaThreshold, {
            duration,
          }),
        },
      ],
      opacity: withTiming(showHeader.value ? 1 : 0, { duration }),
    };

    if (collapseHeight) {
      style.height = withTiming(showHeader.value ? deltaThreshold : 0, {
        duration,
      });
    }

    return style;
  });

  // Track scroll direction
  const lastOffsetY = React.useRef(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (checkScrollable) {
      const contentHeight = e.nativeEvent.contentSize.height;
      const layoutHeight = e.nativeEvent.layoutMeasurement.height;

      // If content is not scrollable, force header to be visible and ignore scroll
      if (contentHeight <= layoutHeight) {
        handleHeaderVisibility(true);
        return;
      }
    }

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
