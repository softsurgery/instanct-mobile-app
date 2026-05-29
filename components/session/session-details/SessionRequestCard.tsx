import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUserAvatar, identifyUser } from "@/lib/user";
import { cn } from "@/lib/utils";
import { ResponseRequestDto } from "@/types";
import { ArrowRight, Clock, MapPin } from "lucide-react-native";
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
    className: "w-12 h-12 border border-border rounded-full",
    size: { width: 48, height: 48 },
  });

  const requestTime = request?.time ? new Date(request.time) : null;
  const createdAt = request?.createdAt ? new Date(request.createdAt) : null;

  return (
    <Card className={cn("mx-4 my-2 shadow-none border-border/50", className)}>
      <CardContent className="p-4 flex flex-col gap-4">
        {/* Header with time ago */}
        <View className="flex-row justify-between items-center">
          <Text className="text-sm font-medium text-foreground">
            {isIncoming ? "Incoming request" : "Outgoing request"}
          </Text>
          {createdAt && (
            <Text className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {timeAgo(createdAt)}
            </Text>
          )}
        </View>

        {/* Avatars with connector */}
        <View className="flex-row items-center">
          <View className="items-center w-[70px]">
            {images[0]}
            <Text
              className="text-xs mt-2 font-medium truncate w-full text-center"
              numberOfLines={1}
            >
              {identifyUser(sender)}
            </Text>
          </View>

          <View className="flex-1 flex-row items-center px-2">
            <View
              className="flex-1 border-t border-dashed border-muted-foreground/30"
              style={{ borderTopWidth: 1 }}
            />
            <Icon
              as={ArrowRight}
              size={14}
              className="text-muted-foreground mx-2"
            />
            <View
              className="flex-1 border-t border-dashed border-muted-foreground/30"
              style={{ borderTopWidth: 1 }}
            />
          </View>

          <View className="items-center w-[70px]">
            {images[1]}
            <Text
              className="text-xs mt-2 font-medium truncate w-full text-center"
              numberOfLines={1}
            >
              {identifyUser(receiver)}
            </Text>
          </View>
        </View>

        {/* Additional info: Message, Location, Time */}
        {(request?.message || request?.location || request?.time) && (
          <View className="mt-2 p-3 bg-muted/20 rounded-xl flex col gap-3 border border-border/30">
            {request.message && (
              <Text className="text-sm text-foreground italic leading-5">
                &quot;{request?.message}&quot;
              </Text>
            )}
            {(request.location || request.time) && (
              <View className="flex flex-col gap-2">
                {requestTime && (
                  <View className="flex-row items-center gap-2">
                    <Icon
                      as={Clock}
                      size={14}
                      className="text-muted-foreground"
                    />
                    <Text className="text-xs text-muted-foreground">
                      {toLongDateString(requestTime)} at{" "}
                      {toTimeOnly(requestTime)}
                    </Text>
                  </View>
                )}
                {request?.location && (
                  <View className="flex-row items-center gap-2">
                    <Icon
                      as={MapPin}
                      size={14}
                      className="text-muted-foreground"
                    />
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
        )}
      </CardContent>
    </Card>
  );
};
