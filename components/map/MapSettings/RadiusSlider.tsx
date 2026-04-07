import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { hslToHex, THEME } from "@/lib/theme";
import { Slider } from "@miblanchard/react-native-slider";
import { useColorScheme } from "nativewind";
import React from "react";
import { View } from "react-native";
import * as Haptics from "expo-haptics";

interface RadiusSliderProps {
  initialValue: number;
  onValueChange: (value: number) => void;
  rangeMaxValue?: number;
  rangeMinValue?: number;
  step?: number;
}

export const RadiusSlider = ({
  initialValue,
  onValueChange,
  rangeMinValue = 0,
  rangeMaxValue = 100,
  step = 50,
}: RadiusSliderProps) => {
  const { colorScheme } = useColorScheme();
  const [localRadius, setLocalRadius] = React.useState(initialValue);

  const handleValueChange = (value: number | number[]) => {
    setLocalRadius(Array.isArray(value) ? value[0] : value);
  };

  const handleSlidingComplete = (value: number | number[]) => {
    Haptics.impactAsync();
    onValueChange(Array.isArray(value) ? value[0] : value);
  };

  return (
    <View className="flex flex-col">
      <View className="flex flex-row justify-between items-center">
        <View>
          <Text className="font-semibold text-base">Search Radius</Text>
        </View>
        <Badge variant="outline">
          <Text className="text-sm font-bold">{localRadius} km</Text>
        </Badge>
      </View>

      <View className="flex flex-col">
        <Slider
          thumbTintColor={hslToHex(
            colorScheme === "dark" ? THEME.dark.primary : THEME.light.primary,
          )}
          minimumTrackTintColor={hslToHex(
            colorScheme === "dark" ? THEME.dark.primary : THEME.light.primary,
          )}
          maximumTrackTintColor={hslToHex(
            colorScheme === "dark"
              ? THEME.dark.foreground
              : THEME.light.foreground,
          )}
          animateTransitions
          value={localRadius}
          minimumValue={rangeMinValue}
          maximumValue={rangeMaxValue}
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          step={step}
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
