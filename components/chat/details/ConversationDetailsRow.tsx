import React from "react";
import { Icon } from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { useColorPalette } from "@/hooks/useColorPalette";
import { hslToHex } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ChevronRight, LucideIcon } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

interface ConversationDetailsRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  showChevron?: boolean;
  destructive?: boolean;
  onPress?: () => void;
  description?: string;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

/**
 * Reusable settings list row item supporting press actions, switch toggles, icons, and destructive styling.
 */
export const ConversationDetailsRow = ({
  icon,
  label,
  value,
  showChevron = true,
  destructive,
  onPress,
  description,
  toggleValue,
  onToggle,
}: ConversationDetailsRowProps) => {
  const { palette } = useColorPalette();

  const isToggle = toggleValue !== undefined;
  const isInteractive = !!onPress && !isToggle;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={isInteractive ? 0.6 : 1}
      className={cn(
        "flex-row items-center px-4 py-3.5",
        isInteractive && "active:bg-muted/50",
      )}
    >
      <View
        className={cn(
          "h-9 w-9 items-center justify-center rounded-xl",
          destructive ? "bg-destructive/10" : "bg-muted",
        )}
      >
        <Icon
          as={icon}
          size={19}
          color={hslToHex(
            destructive ? palette.destructive : palette.foreground,
          )}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className={cn(
            "text-[15px]",
            destructive ? "text-destructive" : "text-foreground",
          )}
        >
          {label}
        </Text>
        {description && (
          <Text className="mt-0.5 text-sm text-muted-foreground">
            {description}
          </Text>
        )}
      </View>

      <View className="flex-row items-center">
        {isToggle ? (
          <Switch
            checked={toggleValue}
            onCheckedChange={(checked) => onToggle?.(checked)}
          />
        ) : (
          <>
            {value && (
              <Text
                className="mr-2 max-w-[140px] text-sm text-muted-foreground"
                numberOfLines={1}
              >
                {value}
              </Text>
            )}
            {showChevron && isInteractive && (
              <Icon
                as={ChevronRight}
                size={18}
                color={hslToHex(palette.foreground)}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};
