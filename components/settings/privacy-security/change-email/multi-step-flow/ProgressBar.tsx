import React from "react";
import { View } from "react-native";
import { cn } from "~/lib/utils";
import { StepConfig } from "./stepper.types";
import { Text } from "@/components/ui/text";

interface Props<TData> {
  steps: StepConfig<TData>[];
  currentIndex: number;
}

export function ProgressBar<TData>({ steps, currentIndex }: Props<TData>) {
  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center justify-between">
        {steps.map((_, index) => (
          <React.Fragment key={index}>
            <View
              className={cn(
                "h-8 w-8 items-center justify-center rounded-full flex",
                index <= currentIndex ? "bg-primary" : "bg-muted",
              )}
            >
              <Text className="text-xs font-semibold text-white">
                {index + 1}
              </Text>
            </View>

            {index < steps.length - 1 && (
              <View
                className={cn(
                  "mx-2 h-1 flex-1 rounded-full",
                  index < currentIndex ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      <View className="flex-row justify-between px-1">
        {steps.map((s) => (
          <Text key={s.id} className="text-xs text-muted-foreground">
            {s.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
