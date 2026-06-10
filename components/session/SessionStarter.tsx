import React from "react";
import { cn } from "@/lib/utils";
import { TouchableOpacity, View } from "react-native";
import { Text } from "../ui/text";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface SessionStarterProps {
  className?: string;
}

export const SessionStarter = ({ className }: SessionStarterProps) => {
  const height = useSharedValue(1);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    height.value = withTiming(1, { duration: 300 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    height: 300,
    overflow: "hidden",
  }));

  return (
    <View
      className={cn("flex-1 items-center justify-center gap-6 px-6", className)}
    >
      <TouchableOpacity
        onPress={() => router.push("/main/explore/session-starter")}
        activeOpacity={0.8}
      >
        <Animated.View style={animatedStyle}>
          <LottieView
            autoPlay
            loop
            style={{
              width: 300,
              height: 300,
            }}
            source={require("~/assets/lotties/power-on.json")}
          />
        </Animated.View>
      </TouchableOpacity>
      <Text variant={"h1"} className="text-center">
        Prêt à connecter ?
      </Text>
      <Text className="text-center text-base px-2">
        Commencez votre première session !
      </Text>
    </View>
  );
};
