import React from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUserAvatar, identifyUser } from "@/lib/user";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/date";
import { RequestStatus, ResponseRequestDto } from "@/types";
import { Icon } from "@/components/ui/icon";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";

interface SessionRequestCardProps {
  className?: string;
  request: ResponseRequestDto;
  isIncoming?: boolean;
}

const statusColorMap: Record<string, string> = {
  [RequestStatus.Sent]: "#fbbf24",
  [RequestStatus.Accepted]: "#34d399",
  [RequestStatus.Rejected]: "#f87171",
};

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
    ids,
    fallbacks,
    className: "w-12 h-12 rounded-full",
    size: { width: 50, height: 50 },
  });

  const createdAt = request?.createdAt ? new Date(request.createdAt) : null;

  const statusColor = statusColorMap[request.status ?? ""] ?? "#94a3b8";

  // Incoming => show sender
  // Outgoing => show receiver
  const person = isIncoming ? sender : receiver;
  const personImage = isIncoming ? images?.[0] : images?.[1];

  return (
    <Pressable
      className={cn(
        "flex-row items-center gap-4 p-2 active:opacity-75",
        className,
      )}
      onPress={() => {
        router.push({
          pathname: "/main/request/answer",
          params: { id: request.id },
        });
      }}
    >
      {/* Avatar with brand ring + saved marker */}
      <View className="relative">
        <View
          className="rounded-full p-[3px]"
          style={{ backgroundColor: `${statusColor}1f` }}
        >
          <View className="rounded-full bg-muted">{personImage}</View>
        </View>
        <View
          className="absolute -bottom-0.5 -right-0.5 h-6 w-6 items-center justify-center rounded-full border-2 border-card"
          style={{ backgroundColor: statusColor }}
        >
          <Icon as={isIncoming ? ArrowDownLeft : ArrowUpRight} size={12} color="#ffffff" />
        </View>
      </View>

      <View className="flex-1">
        <Text
          className="text-base font-semibold text-foreground"
          numberOfLines={1}
        >
          {identifyUser(person)}
        </Text>

        <View className="mt-1 flex-row items-center gap-2">
          <Text
            className="text-sm font-extrabold uppercase"
            style={{ color: statusColor }}
          >
            {request.status}
          </Text>
          {createdAt && (
            <Text className="text-xs font-medium text-muted-foreground">
              • {timeAgo(createdAt)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};
