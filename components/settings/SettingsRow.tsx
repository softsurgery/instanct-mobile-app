import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import { StablePressable } from "../shared/StablePressable";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";

export interface SettingRowConfig {
  title?: string;
  description?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  rightComponent?: React.ReactNode;
  disabled?: boolean;
  Component?: React.ComponentType;
  className?: string;
  onPress?: () => void;
}

interface SettingRowProps extends SettingRowConfig {
  className?: string;
}

export const SettingRow = ({
  className,
  title,
  description,
  leftIcon,
  rightIcon,
  rightComponent,
  disabled = false,
  Component,
  onPress,
}: SettingRowProps) => {
  const isPressable = !!onPress && !disabled;

  const renderedComponent = useMemo(() => {
    if (!Component) return null;
    return <Component />;
  }, [Component]);

  if (Component) {
    return isPressable ? (
      <StablePressable
        onPress={onPress}
        className={cn("w-full", disabled && "opacity-50")}
      >
        <View className={cn(className)}>{renderedComponent}</View>
      </StablePressable>
    ) : (
      <View className={cn(disabled && "opacity-50")}>
        <View className={cn(className)}>{renderedComponent}</View>
      </View>
    );
  }

  const content = (
    <View className="flex flex-row justify-between items-center w-full">
      {/* Left side */}
      <View className="flex flex-row items-center gap-3 flex-1">
        {leftIcon ? (
          <Icon as={leftIcon} size={20} className="text-foreground" />
        ) : null}
        {title || description ? (
          <View className="flex-1">
            {title ? (
              <Text className="font-semibold text-base">{title}</Text>
            ) : null}
            {description ? (
              <Text className="text-xs text-muted-foreground">
                {description}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Right side */}
      {rightComponent || rightIcon ? (
        <View className="flex flex-row items-center gap-2">
          {rightComponent}
          {rightIcon ? (
            <Icon as={rightIcon} size={18} className="text-muted-foreground" />
          ) : null}
        </View>
      ) : null}
    </View>
  );

  return isPressable ? (
    <Pressable
      onPress={onPress}
      className={cn(
        "w-full active:opacity-50",
        disabled && "opacity-50",
        className,
      )}
    >
      {content}
    </Pressable>
  ) : (
    <View className={cn(disabled && "opacity-50", className)}>{content}</View>
  );
};

// Builder function for creating typed row configurations
export const createSettingRow = (config: SettingRowConfig): SettingRowConfig =>
  config;
