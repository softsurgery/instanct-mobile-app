import React from "react";
import LottieView from "lottie-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

interface NotFoundProps {
  size?: "small" | "large" | number;
  className?: string;
  message?: string | string[];
}

export const NotFound = ({
  size = "large",
  className,
  message = "",
}: NotFoundProps) => {
  const height = useSharedValue(1);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    height.value = withTiming(1, { duration: 300 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    height: height.value * (size === "small" ? 100 : 200),
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
          source={require("~/assets/lotties/not-found.json")}
        />
      </Animated.View>
      <View className="flex flex-col items-center gap-2">
        {Array.isArray(message) ? (
          message.map((m, i) => (
            <Text key={i} className="text-lg font-bold text-center">
              {m}
            </Text>
          ))
        ) : (
          <Text className="text-lg font-bold text-center">{message}</Text>
        )}
      </View>
    </View>
  );
};
