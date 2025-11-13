import { Info } from "lucide-react-native";
import { Alert } from "react-native";
import { StablePressable } from "~/components/shared/StablePressable";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";

interface ChatHeaderRightProps {
  className?: string;
}

export const ChatHeaderRight = ({ className }: ChatHeaderRightProps) => {
  return (
    <StablePressable
      className={cn("mx-2", className)}
      onPress={() => {
        Alert.alert("This is supposed to be informative");
      }}
    >
      <Icon as={Info} size={20} />
    </StablePressable>
  );
};
