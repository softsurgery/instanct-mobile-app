import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

export interface ChatActionGridItemProps {
  className?: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  iconColor: string;
  onPress: () => void;
  disabled?: boolean;
}

export const ChatActionGridItem = ({
  label,
  sublabel,
  className,
  icon,
  iconColor,

  onPress,
  disabled,
}: ChatActionGridItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        "flex-1 items-center active:scale-95 active:opacity-80",
        disabled && "opacity-40",
        className,
      )}
    >
      <View className="mb-2 items-center justify-center">
        <Icon as={icon as LucideIcon} size={26} color={iconColor} />
      </View>
      <Text className="text-center text-sm font-semibold">{label}</Text>
      <Text className="mt-px text-center text-xs text-muted-foreground">
        {sublabel}
      </Text>
    </Pressable>
  );
};
