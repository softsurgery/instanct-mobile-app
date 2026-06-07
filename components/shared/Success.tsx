import React from "react";
import LottieView from "lottie-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Text } from "@/components/ui/text";
import { TextProps, View } from "react-native";

interface SuccessProps {
  size?: "small" | "large" | number;
  className?: string;
  message?: string;
  textProps?: TextProps;
}

export const Success = ({
  size = "large",
  className,
  message = "",
  textProps,
}: SuccessProps) => {
  const height = useSharedValue(1);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    height.value = withTiming(1, { duration: 300 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    height: size === "small" ? 100 : size === "large" ? 200 : size,
    overflow: "hidden",
  }));

  return (
    <View className={className}>
      <Animated.View style={animatedStyle}>
        <LottieView
          autoPlay
          loop
          style={{
            width: size === "small" ? 100 : size === "large" ? 200 : size,
            height: size === "small" ? 100 : size === "large" ? 200 : size,
          }}
          source={require("~/assets/success.json")}
        />
      </Animated.View>
      <Text className="-mt-4" {...textProps}>
        {message}
      </Text>
    </View>
  );
};
