import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUserAvatar, identifyUser } from "@/lib/user";
import { cn } from "@/lib/utils";
import { ResponseRequestDto } from "@/types";
import {
  ArrowRight,
  Clock,
  MapPin,
  MessageCircle,
  Redo,
} from "lucide-react-native";
import { View } from "react-native";
import { timeAgo, toTimeOnly, toLongDateString } from "@/lib/date";

interface SessionRequestCardProps {
  className?: string;
  request: ResponseRequestDto;
  isIncoming?: boolean;
}

export const SessionRequestCard: React.FC<SessionRequestCardProps> = ({
  className,
  request,
  isIncoming = true,
}) => {
  const sender = request?.session?.user;
  const receiver = request?.receivers?.[0];

  const ids = [sender?.pictureId, receiver?.pictureId];
  const fallbacks = [identifyUserAvatar(sender), identifyUserAvatar(receiver)];

  const { jsxArray: images } = useServerImages({
    ids: ids,
    fallbacks: fallbacks,
    className: "w-12 h-12 border-2 border-background rounded-full",
    size: { width: 48, height: 48 },
  });

  const requestTime = request?.time ? new Date(request.time) : null;
  const createdAt = request?.createdAt ? new Date(request.createdAt) : null;

  //  border border-border/25 bg-card/25 rounded-xl
  return (
    <View className={cn("p-4", className)}>
      {/* Header with badge and time */}
      <View className="flex-row justify-between items-center mb-4">
        {createdAt && (
          <Text className="text-[11px] text-muted-foreground">
            {timeAgo(createdAt)}
          </Text>
        )}
      </View>

      {/* Avatars with arrow connector */}
      <View className="flex-row items-center justify-center py-2">
        <View className="items-center" style={{ width: 80 }}>
          <View className="shadow-sm rounded-full">{images[0]}</View>
          <Text
            className="text-xs mt-2 font-medium text-foreground text-center w-full"
            numberOfLines={1}
          >
            {identifyUser(sender)}
          </Text>
        </View>

        <View className="flex-1 flex-row items-center justify-center px-3">
          <View className="w-7 h-7 rounded-full bg-muted/50 items-center justify-center mx-1">
            <Icon
              as={Redo}
              size={28}
              className={cn(isIncoming ? "text-blue-500" : "text-orange-500")}
            />
          </View>
        </View>

        <View className="items-center" style={{ width: 80 }}>
          <View className="shadow-sm rounded-full">{images[1]}</View>
          <Text
            className="text-xs mt-2 font-medium text-foreground text-center w-full"
            numberOfLines={1}
          >
            {identifyUser(receiver)}
          </Text>
        </View>
      </View>

      {/* Additional info: Message, Location, Time */}
      {(request?.message || request?.location || request?.time) && (
        <View className="mt-3 p-3 rounded-xl gap-2.5">
          {request.message && (
            <View className="flex flex-row items-start gap-2">
              <Icon
                as={MessageCircle}
                size={13}
                className="text-muted-foreground"
              />
              <Text className="text-sm text-foreground italic">
                &quot;{request?.message}&quot;
              </Text>
            </View>
          )}
          {requestTime && (
            <View className="flex-row items-center gap-2">
              <Icon as={Clock} size={13} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">
                {toLongDateString(requestTime)} at {toTimeOnly(requestTime)}
              </Text>
            </View>
          )}
          {request?.location && (
            <View className="flex-row items-center gap-2">
              <Icon as={MapPin} size={13} className="text-muted-foreground" />
              <Text
                className="text-xs text-muted-foreground flex-1"
                numberOfLines={2}
              >
                {request?.location}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
