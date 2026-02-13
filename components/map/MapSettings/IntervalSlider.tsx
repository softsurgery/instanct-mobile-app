import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { Slider } from "react-native-awesome-slider";
import { useSharedValue } from "react-native-reanimated";

const INTERVAL_STEPS = [5, 10, 15, 30, 60];

interface IntervalSliderProps {
  updateInterval: number;
  onValueChange: (value: number) => void;
}

export const IntervalSlider = ({
  updateInterval,
  onValueChange,
}: IntervalSliderProps) => {
  const sliderProgress = useSharedValue(INTERVAL_STEPS.indexOf(updateInterval));
  const sliderMin = useSharedValue(0);
  const sliderMax = useSharedValue(INTERVAL_STEPS.length - 1);

  const handleSlidingComplete = (value: number) => {
    onValueChange(INTERVAL_STEPS[value]);
  };

  return (
    <View className="flex flex-col gap-4">
      <View className="flex flex-row justify-between items-center">
        <View>
          <Text className="font-semibold text-base">Update Interval</Text>
          <Text className="text-xs text-muted-foreground">
            Refresh every {updateInterval} seconds
          </Text>
        </View>
        <Badge variant="outline">
          <Text className="text-xs font-medium">{updateInterval}s</Text>
        </Badge>
      </View>

      <View className="flex flex-col gap-3">
        <Slider
          progress={sliderProgress}
          minimumValue={sliderMin}
          maximumValue={sliderMax}
          style={{ width: "100%" }}
          onSlidingComplete={handleSlidingComplete}
          forceSnapToStep
        />
        <View className="flex flex-row justify-between">
          <Text className="text-xs text-muted-foreground">
            {INTERVAL_STEPS[0]}s
          </Text>
          <Text className="text-xs text-muted-foreground">
            {INTERVAL_STEPS[INTERVAL_STEPS.length - 1]}s
          </Text>
        </View>
      </View>
    </View>
  );
};
