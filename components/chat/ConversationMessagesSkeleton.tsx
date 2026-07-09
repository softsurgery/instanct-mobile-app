import { Dimensions, View } from "react-native";
import { cn } from "~/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface ConversationMessagesSkeletonProps {
  className?: string;
}

const CONTENT_WIDTH = Dimensions.get("window").width - 24;

const MESSAGE_SKELETONS = [
  { right: true, width: CONTENT_WIDTH * 0.4, height: 56 },
] as const;

/**
 * Skeleton loading placeholder rendered while initial conversation messages are being fetched.
 */
export const ConversationMessagesSkeleton = ({
  className,
}: ConversationMessagesSkeletonProps) => {
  return (
    <View className={cn("flex-1 justify-end px-3 py-4 gap-2", className)}>
      {MESSAGE_SKELETONS.map((bubble, index) => (
        <View
          key={index}
          className={cn(
            "w-full flex-row",
            bubble.right ? "justify-end" : "justify-start",
          )}
        >
          <Skeleton
            className={cn("rounded-xl border border-border")}
            style={{ width: bubble.width, height: bubble.height }}
          />
        </View>
      ))}
    </View>
  );
};
