import LottieView from "lottie-react-native";
import React from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface LoaderProps {
  isPending: boolean;
  size?: "small" | "large" | number;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  isPending,
  size = "large",
  className,
}) => {
  const height = useSharedValue(isPending ? 1 : 0); // 1 = visible, 0 = hidden
  const opacity = useSharedValue(isPending ? 1 : 0);

  React.useEffect(() => {
    height.value = withTiming(isPending ? 1 : 0, { duration: 300 });
    opacity.value = withTiming(isPending ? 1 : 0, { duration: 300 });
  }, [isPending]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    height: height.value * (size === "small" ? 100 : 200), // dynamically adjust
    overflow: "hidden",
  }));

  return (
    <Animated.View style={animatedStyle} className={className}>
      {isPending && (
        <LottieView
          autoPlay
          loop
          style={{
            width: size === "small" ? 100 : size === "large" ? 200 : size,
            height: size === "small" ? 100 : size === "large" ? 200 : size,
          }}
          source={require("~/assets/lottie-loader.json")}
        />
      )}
    </Animated.View>
  );
};
