import { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { cn } from "@/lib/utils";

interface RequestDetailsCardProps {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  emptyText?: string;
  children?: React.ReactNode;
}

export const RequestDetailsCard = ({
  icon,
  label,
  value,
  emptyText = "Non spécifié",
  children,
}: RequestDetailsCardProps) => {
  const isEmpty = !children && !value;
  return (
    <View className="flex-row items-start gap-3">
      <View className="h-9 w-9 items-center justify-center">
        <Icon as={icon} size={17} className="text-muted-foreground" />
      </View>

      <View className="flex-1 pt-0.5">
        <Text className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </Text>
        {children ? (
          children
        ) : (
          <Text
            className={cn(
              "text-sm leading-5",
              isEmpty ? "italic text-muted-foreground/70" : "text-foreground",
            )}
          >
            {value || emptyText}
          </Text>
        )}
      </View>

      {/* {editable && (
        <Pressable
          onPress={onEdit}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center rounded-full active:bg-muted"
        >
          <Icon as={Edit3Icon} size={16} className="text-muted-foreground" />
        </Pressable>
      )} */}
    </View>
  );
};
