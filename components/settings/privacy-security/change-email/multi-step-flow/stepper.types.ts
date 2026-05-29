export type StepConfig<TData = any> = {
  id: string;
  label: string;
  component: React.ComponentType<StepComponentProps<TData>>;
  validate?: (data: TData) => Record<string, string>;
};

export interface StepComponentProps<TData> {
  data: TData;
  setData: (data: Partial<TData>) => void;
  errors: Record<string, string>;
  clearError: (key: string) => void;
}

export interface MultiStepFlowProps<TData> {
  steps: StepConfig<TData>[];
  initialData: TData;
  onFinish: (data: TData) => void;
}
