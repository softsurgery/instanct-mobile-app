import { router } from "expo-router";
import { EllipsisVertical, Search } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";

interface ChatHeaderRightProps {
  className?: string;
  conversationId: number;
  onSearchPress?: () => void;
}

/**
 * Navigation bar right header displaying in-conversation search icon and details menu trigger.
 */
export const ChatHeaderRight = ({
  className,
  conversationId,
  onSearchPress,
}: ChatHeaderRightProps) => {
  return (
    <View className={cn("flex-row items-center", className)}>
      {onSearchPress && (
        <Pressable
          className="p-2 rounded-full active:bg-muted"
          onPress={onSearchPress}
        >
          <Icon as={Search} size={22} />
        </Pressable>
      )}
      <Pressable
        className="p-2 mr-1 rounded-full active:bg-muted"
        onPress={() => {
          router.push({
            pathname: "/main/chat/conversation-details",
            params: { id: String(conversationId) },
          });
        }}
      >
        <Icon as={EllipsisVertical} size={24} />
      </Pressable>
    </View>
  );
};
