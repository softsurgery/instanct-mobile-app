import React from "react";
import { View } from "react-native";
import { StepRenderer } from "./StepRenderer";
import { ProgressBar } from "./ProgressBar";
import { useMultiStepFlow } from "./useMultiStepFlow";
import { MultiStepFlowProps } from "./stepper.types";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export function MultiStepFlow<TData>({
  steps,
  initialData,
  onFinish,
}: MultiStepFlowProps<TData>) {
  const {
    step,
    stepIndex,
    isLastStep,
    data,
    errors,
    setData,
    clearError,
    next,
    back,
  } = useMultiStepFlow(steps, initialData, onFinish);

  return (
    <View>
      <ProgressBar steps={steps} currentIndex={stepIndex} />

      <StepRenderer
        step={step}
        data={data}
        setData={setData}
        errors={errors}
        clearError={clearError}
      />

      <View className="flex-row gap-3 pt-4">
        {stepIndex > 0 && (
          <Button variant="outline" className="flex-1" onPress={back}>
            <Text>previous</Text>
          </Button>
        )}

        <Button className="flex-1" onPress={next}>
          <Text>{isLastStep ? "Finish" : "Continue"}</Text>
        </Button>
      </View>
    </View>
  );
}
