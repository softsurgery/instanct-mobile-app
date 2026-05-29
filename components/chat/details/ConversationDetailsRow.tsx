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

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-2 active:bg-muted/50"
    >
      <View
        className={cn(
          "w-9 h-9 items-center justify-center rounded-lg",
          destructive ? "bg-destructive/10" : "bg-muted",
        )}
      >
        <Icon
          as={icon}
          size={20}
          color={hslToHex(
            destructive ? palette.destructive : palette.foreground,
          )}
        />
      </View>
      <View className="flex-1 ml-3">
        <Text
          className={cn(
            "text-[15px]",
            destructive ? "text-destructive" : "text-foreground",
          )}
        >
          {label}
        </Text>
        {description && (
          <Text className="text-muted-foreground text-sm mt-0.5">
            {description}
          </Text>
        )}
      </View>
      <View className="flex-row items-center">
        {toggleValue !== undefined ? (
          <Switch
            checked={toggleValue}
            onCheckedChange={(checked) => onToggle?.(checked)}
          />
        ) : (
          <>
            {value && (
              <Text className="text-muted-foreground text-sm mr-2">
                {value}
              </Text>
            )}
            {showChevron && (
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
