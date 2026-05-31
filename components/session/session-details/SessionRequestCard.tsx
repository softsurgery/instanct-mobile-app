import { Text } from "@/components/ui/text";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUserAvatar, identifyUser } from "@/lib/user";
import { cn } from "@/lib/utils";
import { RequestStatus, ResponseRequestDto } from "@/types";
import { Pressable, View } from "react-native";
import { timeAgo } from "@/lib/date";
import { Separator } from "@/components/ui/separator";
import { router } from "expo-router";

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
    size: { width: 78, height: 78 },
  });

  const createdAt = request?.createdAt ? new Date(request.createdAt) : null;

  const statusColorMap: Record<string, string> = {
    [RequestStatus.Sent]: "#fbbf24",
    [RequestStatus.Accepted]: "#34d399",
    [RequestStatus.Rejected]: "#f87171",
  };

  const statusColor = statusColorMap[request.status ?? ""] ?? "#94a3b8";

  const youSide: "sender" | "receiver" = isIncoming ? "receiver" : "sender";

  const RenderPerson: React.FC<{
    className?: string;
    user: typeof sender;
    index: number;
    side: "sender" | "receiver";
  }> = ({ className, user, index, side }) => (
    <View className={cn("items-center", className)} style={{ width: 92 }}>
      <View
        className="rounded-full"
        style={{ backgroundColor: `${statusColor}25` }}
      >
        <View className="rounded-full shadow-sm">{images[index]}</View>
      </View>
      <Text
        className="mt-2 w-full text-center text-xs font-semibold text-foreground"
        numberOfLines={1}
      >
        {identifyUser(user)}
      </Text>
      {youSide === side ? (
        <View
          className="mt-1 rounded-full px-2 py-[1px]"
          style={{ backgroundColor: `${statusColor}25` }}
        >
          <Text
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: statusColor }}
          >
            You
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <Pressable
      className={cn("rounded-md active:opacity-75", className)}
      onPress={() => {
        router.push({
          pathname: `/main/request/answer`,
          params: { id: request.id },
        });
      }}
    >
      {/* Left accent rail */}
      <View
        className="absolute bottom-0 left-0 top-0 w-1"
        style={{ backgroundColor: `${statusColor}25` }}
      />

      {/* Header band: direction + when */}
      <View
        className="flex-row items-center justify-between px-4 py-2.5"
        style={{ backgroundColor: `${statusColor}25` }}
      >
        <View className="flex-row items-center gap-1.5">
          <Text className="text-xs font-bold uppercase tracking-wide">
            {request.status}
          </Text>
        </View>
        {createdAt && (
          <Text className="text-xs font-medium text-muted-foreground">
            {timeAgo(createdAt)}
          </Text>
        )}
      </View>

      {/* Flow: sender → receiver */}
      <View className="flex flex-row items-start justify-between px-2 pb-1 pt-4">
        <RenderPerson
          className="flex-1"
          user={sender}
          index={0}
          side="sender"
        />

        {/* <View className="flex-1 flex-row items-center justify-center px-1">
          <View
            className="flex-1 border-t border-dashed"
            style={{ borderColor: `${accent}59` }}
          />
          <View
            className="flex-1 border-t border-dashed"
            style={{ borderColor: `${accent}59` }}
          />
          <View
            className="flex-1 border-t border-dashed"
            style={{ borderColor: `${accent}59` }}
          />
        </View> */}
        <Separator className="flex-1 border border-dashed my-auto" />

        <RenderPerson
          className="flex-1"
          user={receiver}
          index={1}
          side="receiver"
        />
      </View>
    </Pressable>
  );
};
