import { cn } from "@/lib/utils";
import React from "react";
import { View } from "react-native";
import { StablePressable } from "./StablePressable";
import { Text } from "../ui/text";
import { Checkbox } from "../ui/checkbox";

export interface ChoicePickerOption {
  label: string;
  value: string;
}

interface ChoicePickerProps {
  className?: string;
  options: ChoicePickerOption[];
  value: string;
  onSelectChange: (value: string) => void;
}

export const ChoicePicker = ({
  className,
  options,
  value,
  onSelectChange,
}: ChoicePickerProps) => {
  return (
    <View className={cn("gap-4", className)}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <StablePressable
            key={option.value}
            className={cn(
              "rounded-2xl px-6 py-5",
              isSelected ? "border-2 border-primary" : "border border-border",
            )}
            onPressClassname="opacity-80"
            onPress={() => onSelectChange(option.value)}
          >
            <View className="flex-row items-center gap-4">
              <View className="h-8 w-8 items-center justify-center">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSelectChange(option.value);
                    }
                  }}
                  classNames={{
                    root: cn(
                      "size-8 rounded-full",
                      !isSelected && "border-foreground/70",
                    ),
                    checked: "rounded-full border-primary",
                    indicator: "rounded-full",
                  }}
                  icon={{
                    size: 18,
                  }}
                />
              </View>
              <Text
                className={cn(
                  "flex-1 text-sm text-foreground",
                  isSelected ? "font-semibold" : "font-medium",
                )}
              >
                {option.label}
              </Text>
            </View>
          </StablePressable>
        );
      })}
    </View>
  );
};
