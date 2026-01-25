import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react-native";
import { StablePressable } from "../StablePressable";

interface TappableProps {
  className?: string;
  classNames?: {
    content?: string;
    pressable?: string;
  };
  children?: React.ReactNode;
  onPress?: () => void;
}

export const Tappable = ({
  className,
  classNames = {
    content: "text-muted-foreground",
    pressable: "bg-primary/25",
  },
  children,
  onPress,
}: TappableProps) => {
  return (
    <StablePressable
      className={cn(
        "flex flex-row items-center justify-between py-4 px-2",
        className,
      )}
      onPress={onPress}
      onPressClassname={classNames?.pressable}
    >
      <Text className={cn("text-sm", classNames?.content)}>{children}</Text>
      <Icon as={ChevronRight} size={20} color={"gray"} />
    </StablePressable>
  );
};
