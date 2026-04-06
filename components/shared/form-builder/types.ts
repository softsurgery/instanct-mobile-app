export interface FormStructure {
  title: string;
  description?: string;
  orientation?: "vertical" | "horizontal";
  isHeaderVisible?: boolean;
  fieldsets: Fieldset[];
}

export interface Fieldset {
  title?: string;
  description?: string;
  isHeaderVisible?: boolean;
  rows: FieldsetRow[];
}

export interface FieldsetRow {
  id: number;
  fields: Field[];
}

export interface Field<T = any> {
  id: string;
  label: string;
  className?: string;
  fieldClassName?: string;
  wrapperClassName?: string;
  variant: FieldVariant;
  required?: boolean;
  description?: string;
  placeholder?: string;
  hidden?: boolean;
  error?: string;
  disabled?: boolean;
  props?: T;
}

export enum FieldVariant {
  TEXT = "text",
  EMAIL = "email",
  TEL = "tel",
  NUMBER = "number",
  PASSWORD = "password",
  DATE = "date",
  TIME = "time",
  SELECT = "select",
  MULTISELECT = "multi-select",
  CHECKBOX = "checkbox",
  CHECK = "check",
  RADIO = "radio",
  TEXTAREA = "textarea",
  SWITCH = "switch",
  RATING = "rating",
  PICTURE = "picture",
  CHOICEPICKER = "choice-picker",
  CUSTOM = "custom",
}

export interface TextFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
}

export interface TextareaFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  rows?: number;
}

export interface EmailFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
}

export interface TelFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
}

export interface NumberFieldProps {
  value?: number;
  onChangeText?: (text: number) => void;
  editable?: boolean;
}

export interface PasswordFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
}

export interface DateFieldProps {
  value?: Date;
  onDateChange?: (date: Date) => void;
  editable?: boolean;
}

export interface TimeFieldProps {
  value?: Date;
  onTimeChange?: (time: Date) => void;
  editable?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  value?: string;
  onSelect?: (value: string) => void;
  options?: SelectOption[];
  editable?: boolean;
}

export interface MultiSelectFieldProps {
  value?: string[];
  onSelect?: (value: string[]) => void;
  options?: SelectOption[];
  editable?: boolean;
}

export interface RatingFieldProps {
  value: number;
  onValueChange?: (value: number) => void;
  editable?: boolean;
  color?: string;
}

export interface PictureFieldProps {
  image?: string | null;
  progress?: number;
  alt?: string;
  editable?: boolean;
  onFileChange?: (e: string) => void;
  onUpload?: (file: File, onProgress: (percent: number) => void) => void;
}

export interface RadioFieldProps {
  checked?: string;
  onCheckedChange?: (checked: string) => void;
  editable?: boolean;
  options: SelectOption[];
  itemWidthClass?: string;
}
export interface CheckboxFieldProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  editable?: boolean;
}

export interface SwitchFieldProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  editable?: boolean;
}

export interface ChoicePickerFieldProps {
  value?: string;
  onSelectChange?: (value: string) => void;
  options?: SelectOption[];
  editable?: boolean;
}

export interface CustomFieldProps {
  children?: React.ReactNode;
}
