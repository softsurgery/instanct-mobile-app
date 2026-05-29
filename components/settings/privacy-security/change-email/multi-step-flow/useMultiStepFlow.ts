import React from "react";
import { StepConfig } from "./stepper.types";


export function useMultiStepFlow<TData>(
  steps: StepConfig<TData>[],
  initialData: TData,
  onFinish: (data: TData) => void,
) {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [data, setData] = React.useState<TData>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const step = steps[stepIndex];

  const updateData = (partial: Partial<TData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const clearError = (key: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const next = () => {
    if (step.validate) {
      const validationErrors = step.validate(data);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) return;
    }

    if (stepIndex === steps.length - 1) {
      onFinish(data);
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const back = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  return {
    step,
    stepIndex,
    isLastStep: stepIndex === steps.length - 1,
    data,
    errors,
    setData: updateData,
    clearError,
    next,
    back,
  };
}
