import React from "react";
import { View } from "react-native";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { StableKeyboardAwareScrollView } from "./StableKeyboardAwareScrollView";
import { useKeyboardVisible } from "~/hooks/useKeyboardVisible";
import { cn } from "~/lib/utils";
import { Icon } from "../ui/icon";
import { ArrowLeft, ArrowRight } from "lucide-react-native";

interface StepperProps {
  classNames?: {
    wrapper?: string;
    controlsWrapper?: string;
  };
  steps: { title?: string; description?: string; component: React.ReactNode }[];
  initialStep?: number;
  forwaredAdditionalActions?: Record<number, () => void>;
  backwordAdditionalActions?: Record<number, () => void>;
  closingAction?: {
    label: string;
    onPress: () => void;
  };
}

export const Stepper = ({
  classNames,
  steps,
  initialStep = 0,
  forwaredAdditionalActions = {},
  backwordAdditionalActions = {},
  closingAction,
}: StepperProps) => {
  const isKeyboardVisible = useKeyboardVisible();
  const [currentStep, setCurrentStep] = React.useState(initialStep);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      if (forwaredAdditionalActions[currentStep]) {
        forwaredAdditionalActions[currentStep]();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      if (backwordAdditionalActions[currentStep]) {
        backwordAdditionalActions[currentStep]();
      }
    }
  };

  return (
    <React.Fragment>
      {/* Step Content */}
      <StableKeyboardAwareScrollView className="flex-1">
        <View className="px-2 py-4">
          {steps[currentStep].title && (
            <Text className="text-lg font-semibold">
              {steps[currentStep].title}
            </Text>
          )}
          {steps[currentStep].description && (
            <Text className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </Text>
          )}
        </View>
        {steps[currentStep].component}
      </StableKeyboardAwareScrollView>

      {/* Controls */}
      {!isKeyboardVisible && (
        <View
          className={cn(
            "flex-row justify-between p-4 bg-muted border-t border-border",
            classNames?.controlsWrapper,
          )}
        >
          <Button
            disabled={currentStep === 0}
            onPress={prevStep}
            variant="outline"
            className="px-4 py-2 rounded-xl"
          >
            <Icon as={ArrowLeft} size={16} />
            <Text className="font-semibold">Previous</Text>
          </Button>

          {currentStep === steps.length - 1 && closingAction ? (
            <Button
              size="sm"
              onPress={closingAction.onPress}
              className="rounded-xl bg-green-600"
            >
              <Text className="font-semibold">{closingAction.label}</Text>
            </Button>
          ) : (
            <Button size="sm" onPress={nextStep} className="rounded-xl">
              <Text className="font-semibold">Next</Text>
              <Icon as={ArrowRight} size={16} />
            </Button>
          )}
        </View>
      )}
    </React.Fragment>
  );
};
