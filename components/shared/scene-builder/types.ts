export interface DynamicScene {
  name: string;
  content: Record<string, DynamicSceneSection>;
}

export interface DynamicSceneSection {
  name: string;
  description?: string;
  rows: DynamicSceneRow[];
}

export interface DynamicSceneRow<T = any> {
  label: string;
  labelClassName?: string;
  className?: string;
  wrapperClassName?: string;
  description?: string;
  variant: DynamicSceneRowVariant;
  props?: T;
}

export enum DynamicSceneRowVariant {
  TAPPABLE = "tappable",
  NON_TAPPABLE = "non-tappable",
  TEXT = "text",
  DATE = "date",
  TEXTAREA = "textarea",
  SWITCH = "switch",
  CUSTOM = "custom",
}

export interface DynamicSceneTappableProps {
  onPress: () => void;
}

export interface DynamicSceneNonTappableProps {
  text: string;
}

export interface DynamicSceneTextProps {
  text: string;
  onChangeText?: (text: string) => void;
}

export interface DynamicSceneDateProps {
  date: Date;
  onChangeDate?: (date: Date) => void;
}

export interface DynamicSceneSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}
