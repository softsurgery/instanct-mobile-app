import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useServerImages } from "@/hooks/content/useServerImages";
import { toTimeOnly } from "@/lib/date";
import { identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { ResponseRequestDto } from "@/types";
import { Clock3, MapPin, MessageSquare } from "lucide-react-native";
import { View } from "react-native";

interface SessionRequestCardProps {
  className?: string;
  request: ResponseRequestDto;
  reverse?: boolean;
}

export const SessionRequestCard: React.FC<SessionRequestCardProps> = ({
  className,
  request,
  reverse = true,
}) => {
  const ids = [request.receivers[0]?.pictureId, request.session.user.pictureId];
  const fallbacks = [
    identifyUserAvatar(request.receivers[0]),
    identifyUserAvatar(request.session.user),
  ];
  const { jsxArray: receiverImages, isPending: isReceiverImagePending } =
    useServerImages({
      ids: reverse ? [...ids].reverse() : ids,
      fallbacks: reverse ? [...fallbacks].reverse() : fallbacks,
      className: "w-10 h-10 rounded-full",
      size: { width: 40, height: 40 },
    });

  return (
    <View
      className={cn(
        "mx-4 my-2 border border-border rounded-lg shadow-sm overflow-hidden",
        className,
      )}
    >
      <View className="p-4 gap-3">
        {/* Header */}
        <View className="flex flex-row justify-between items-center gap-3 w-full">
          <View>{receiverImages[0]}</View>
          <View
            className="flex-1 border-t border-dashed border-white"
            style={{ borderTopWidth: 1.5 }}
          />
          <Text className="text-gray-400 text-lg leading-none -ml-0.5">▶</Text>
          <View>{receiverImages[1]}</View>
        </View>
        {/* Message */}
        {request.message && (
          <View className="flex-row items-start gap-3">
            <Icon
              as={MessageSquare}
              size={16}
              className="text-muted-foreground mt-0.5"
            />
            <View>
              <Text className="text-xs text-muted-foreground">Message</Text>
              <Text className="text-sm font-medium">{request.message}</Text>
            </View>
          </View>
        )}

        <View className="flex flex-row justify-between">
          {/* Location */}
          <View className="flex-row items-start gap-3">
            <Icon
              as={MapPin}
              size={16}
              className="text-muted-foreground mt-0.5"
            />
            <View>
              <Text className="text-xs font-medium">
                {request.location || "Not specified"}
              </Text>
            </View>
          </View>

          {/* Time */}
          <View className="flex-row items-start gap-3">
            <Icon
              as={Clock3}
              size={16}
              className="text-muted-foreground mt-0.5"
            />
            <View>
              <Text className="text-xs font-medium">
                {request.time
                  ? toTimeOnly(new Date(request.time))
                  : "Not specified"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
