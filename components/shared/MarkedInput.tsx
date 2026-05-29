import { LucideIcon } from "lucide-react-native";
import { TextInputProps, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface MarkedInputProps extends TextInputProps {
  icon: LucideIcon;
}

export const MarkedInput = ({
  className,
  value,
  onChangeText,
  icon,
  ...rest
}: MarkedInputProps) => {
  return (
    <View className={cn("relative justify-center", className)}>
      <View className="absolute left-3 h-full justify-center z-10">
        <Icon as={icon} size={18} className="text-muted-foreground" />
      </View>

      <Input
        {...rest}
        value={value}
        onChangeText={onChangeText}
        className="pl-10 rounded-full"
      />
    </View>
  );
};
