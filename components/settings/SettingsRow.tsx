import { cn } from "@/lib/utils";
import { View } from "react-native";
import { StablePressable } from "../shared/StablePressable";

interface SettingRowProps {
  className?: string;
  component?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

export const SettingRow = ({
  className,
  component,
  onPress,
  disabled = false,
}: SettingRowProps) => {
  const isPressable = !!onPress && !disabled;

  if (component) {
    return isPressable ? (
      <StablePressable onPress={onPress} className={cn("w-full", className)}>
        {component}
      </StablePressable>
    ) : (
      <View className={cn(className)}>{component}</View>
    );
  }

  return null;
};
