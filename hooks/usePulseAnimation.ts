import React from "react";
import { Animated, Easing } from "react-native";

interface UsePulseAnimationOptions {
  active?: boolean;
  scaleTo?: number;
  duration?: number;
  minOpacity?: number;
  maxOpacity?: number;
}

export const usePulseAnimation = ({
  active = true,
  scaleTo = 1.8,
  duration = 1200,
  minOpacity = 0,
  maxOpacity = 0.6,
}: UsePulseAnimationOptions = {}) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  const opacity = React.useRef(new Animated.Value(maxOpacity)).current;

  React.useEffect(() => {
    if (!active) return;

    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: scaleTo,
            duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: minOpacity,
            duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: maxOpacity,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [active, scaleTo, duration, minOpacity, maxOpacity, scale, opacity]);

  return { scale, opacity };
};
