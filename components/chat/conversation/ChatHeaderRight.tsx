import { router } from "expo-router";
import { EllipsisVertical } from "lucide-react-native";
import { Pressable } from "react-native";
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
    <Pressable
      className={cn("p-2 mr-1 rounded-full active:bg-muted", className)}
      onPress={() => {
        router.push({
          pathname: "/main/chat/conversation-details",
          params: { id: String(conversationId) },
        });
      }}
    >
      <Icon as={EllipsisVertical} size={24} />
    </Pressable>
  );
};
