import { Info } from "lucide-react-native";
import { router } from "expo-router";
import { StablePressable } from "~/components/shared/StablePressable";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";

interface ChatHeaderRightProps {
  className?: string;
  conversationId: number;
}

export const ChatHeaderRight = ({
  className,
  conversationId,
}: ChatHeaderRightProps) => {
  return (
    <StablePressable
      className={cn("mx-2", className)}
      onPress={() => {
        router.push({
          pathname: "/main/chat/conversation-details",
          params: { id: String(conversationId) },
        });
      }}
    >
      <Icon as={Info} size={20} />
    </StablePressable>
  );
};
