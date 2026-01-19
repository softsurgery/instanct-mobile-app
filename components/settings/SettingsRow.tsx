import React from "react";
import { GestureResponderEvent, View } from "react-native";
import { cn } from "@/lib/utils";
import { ChevronRight, LucideIcon } from "lucide-react-native";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";

interface SettingRowProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export const SettingRow = ({
  icon,
  title,
  description,
  trailing,
  onPress,
  disabled = false,
}: SettingRowProps) => {
  const isPressable = !!onPress && !disabled;
  const showChevron = isPressable && !trailing;

  return (
    <Button
      variant="ghost"
      onPress={onPress}
      disabled={!isPressable}
      className={cn(
        "flex flex-row items-center justify-between rounded-xl px-2 h-fit",
        isPressable && "active:bg-accent/60",
        !isPressable && "opacity-50",
      )}
    >
      {/* Left content */}
      <View className="flex flex-row items-center gap-3 flex-1">
        {icon && <Icon as={icon} size={20} className="text-muted-foreground" />}

        <View className="flex-1">
          <Text className="font-semibold">{title}</Text>

          {description && (
            <Text variant="muted" className="mt-1 text-xs">
              {description}
            </Text>
          )}
        </View>
      </View>

      {/* Right content */}
      <View className="flex flex-row items-center gap-2">
        {trailing}

        {showChevron && (
          <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
        )}
      </View>
    </Button>
  );
};
