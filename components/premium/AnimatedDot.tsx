import { THEME } from "@/lib/theme";
import { useColorScheme } from "nativewind";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

export const AnimatedDot = ({
  index,
  progress,
}: {
  index: number;
  progress: any;
}) => {
  const { colorScheme } = useColorScheme();
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [index - 1, index, index + 1],
      [0.3, 1, 0.3],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      progress.value,
      [index - 1, index, index + 1],
      [0.8, 1.2, 0.8],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor:
            colorScheme === "dark" ? THEME.dark.primary : THEME.light.primary,
          marginHorizontal: 4,
        },
        animatedStyle,
      ]}
    />
  );
};
