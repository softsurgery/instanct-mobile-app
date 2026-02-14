import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { useMapStore } from "@/stores/useMapStore";
import React from "react";
import { View } from "react-native";
import { Slider } from "react-native-awesome-slider";
import { useSharedValue } from "react-native-reanimated";

interface RadiusSliderProps {
  onValueChange: (value: number) => void;
  rangeMaxValue?: number;
  rangeMinValue?: number;
  step?: number;
}

export const RadiusSlider = ({
  onValueChange,
  rangeMinValue = 0,
  rangeMaxValue = 100,
  step = 10,
}: RadiusSliderProps) => {
  const mapStore = useMapStore();

  const radiusProgress = useSharedValue(mapStore.parameters.radius);
  const radiusMin = useSharedValue(rangeMinValue);
  const radiusMax = useSharedValue(rangeMaxValue);

  const handleSlidingComplete = (value: number) => {
    onValueChange(value);
  };

  return (
    <View className="flex flex-col gap-4">
      <View className="flex flex-row justify-between items-center">
        <View>
          <Text className="font-semibold text-base">Search Radius</Text>
        </View>
        <Badge variant="outline">
          <Text className="text-sm font-bold">
            {mapStore.parameters.radius} km
          </Text>
        </Badge>
      </View>

      <View className="flex flex-col gap-3">
        <Slider
          progress={radiusProgress}
          minimumValue={radiusMin}
          maximumValue={radiusMax}
          onSlidingComplete={handleSlidingComplete}
          forceSnapToStep
          steps={step}
        />
        <View className="flex flex-row justify-between">
          <Text className="text-xs text-muted-foreground">
            {rangeMinValue} km
          </Text>
          <Text className="text-xs text-muted-foreground">
            {rangeMaxValue} km
          </Text>
        </View>
      </View>
    </View>
  );
};
