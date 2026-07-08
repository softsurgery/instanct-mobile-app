import { LucideIcon } from "lucide-react-native";
import { TextInputProps, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface MarkedInputProps extends TextInputProps {
  classNames?: { input?: string; container?: string };
  icon: LucideIcon;
  position?: "left" | "right";
}

export const MarkedInput = ({
  classNames,
  className,
  value,
  onChangeText,
  icon,
  position,
  ...rest
}: MarkedInputProps) => {
  return (
    <View
      className={cn(
        "relative justify-center",
        classNames?.container,
        className,
      )}
    >
      <View
        className={cn(
          "absolute h-full justify-center z-10",
          position === "left" ? "left-3" : "right-3",
        )}
      >
        <Icon as={icon} size={18} className="text-muted-foreground" />
      </View>

      <Input
        {...rest}
        value={value}
        onChangeText={onChangeText}
        className={cn(
          "rounded-full",
          position === "left" ? "pl-10" : "pr-10",
          classNames?.input,
        )}
      />
    </View>
  );
};
