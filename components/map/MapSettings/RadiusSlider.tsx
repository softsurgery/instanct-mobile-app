import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { hslToHex } from "@/lib/theme";
import { Slider } from "@miblanchard/react-native-slider";
import React from "react";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useColorPalette } from "@/hooks/useColorPalette";

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
  const { palette } = useColorPalette();
  const { t } = useTranslation("settings");
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
          <Text className="font-semibold text-base">
            {t("map-settings.discovery-range.search-radius")}
          </Text>
        </View>
        <Badge variant="outline">
          <Text className="text-sm font-bold">{localRadius} km</Text>
        </Badge>
      </View>

      <View className="flex flex-col">
        <Slider
          thumbTintColor={hslToHex(palette.primary)}
          minimumTrackTintColor={hslToHex(palette.primary)}
          maximumTrackTintColor={hslToHex(palette.foreground)}
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
