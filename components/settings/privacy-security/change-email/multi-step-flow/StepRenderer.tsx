import React from "react";
import { StepConfig } from "./stepper.types";

interface Props<TData> {
  step: StepConfig<TData>;
  data: TData;
  setData: (data: Partial<TData>) => void;
  errors: Record<string, string>;
  clearError: (key: string) => void;
}

export function StepRenderer<TData>({
  step,
  data,
  setData,
  errors,
  clearError,
}: Props<TData>) {
  const Component = step.component;

  return (
    <Component
      data={data}
      setData={setData}
      errors={errors}
      clearError={clearError}
    />
  );
}
