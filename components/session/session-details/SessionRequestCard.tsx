import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUserAvatar, identifyUser } from "@/lib/user";
import { hslToHex, THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ResponseRequestDto } from "@/types";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  MapPin,
  MessageCircle,
  Redo,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import { timeAgo, toTimeOnly, toLongDateString } from "@/lib/date";

interface SessionRequestCardProps {
  className?: string;
  request: ResponseRequestDto;
  isIncoming?: boolean;
}

const PRIMARY = hslToHex(THEME.light.primary);
const BLUE = "#3b82f6";

export const SessionRequestCard: React.FC<SessionRequestCardProps> = ({
  className,
  request,
  isIncoming = true,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

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

  const requestTime = request?.time ? new Date(request.time) : null;
  const createdAt = request?.createdAt ? new Date(request.createdAt) : null;

  const accent = isIncoming ? PRIMARY : BLUE;
  const mutedFg = hslToHex(
    isDark ? THEME.dark.mutedForeground : THEME.light.mutedForeground,
  );
  const DirIcon = isIncoming ? ArrowDownLeft : ArrowUpRight;
  const directionLabel = isIncoming ? "Incoming" : "Outgoing";

  const youSide: "sender" | "receiver" = isIncoming ? "receiver" : "sender";

  const hasDetails = !!(request?.message || request?.location || requestTime);

  const renderPerson = (
    user: typeof sender,
    index: number,
    side: "sender" | "receiver",
  ) => (
    <View className="items-center" style={{ width: 92 }}>
      <View
        className="rounded-full p-1"
        style={{ backgroundColor: `${accent}1f` }}
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
          style={{ backgroundColor: `${accent}1f` }}
        >
          <Text
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: accent }}
          >
            You
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View className={cn("overflow-hidden rounded-md", className)}>
      {/* Left accent rail */}
      <View
        className="absolute bottom-0 left-0 top-0 w-1"
        style={{ backgroundColor: accent }}
      />

      {/* Header band: direction + when */}
      <View
        className="flex-row items-center justify-between px-4 py-2.5"
        style={{ backgroundColor: `${accent}14` }}
      >
        <View className="flex-row items-center gap-1.5">
          <Icon as={DirIcon} size={14} color={accent} />
          <Text
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: accent }}
          >
            {directionLabel}
          </Text>
        </View>
        {createdAt && (
          <Text className="text-xs font-medium text-muted-foreground">
            {timeAgo(createdAt)}
          </Text>
        )}
      </View>

      {/* Flow: sender → receiver */}
      <View className="flex-row items-start justify-center px-4 pb-1 pt-4">
        {renderPerson(sender, 0, "sender")}

        <View className="mt-5 flex-1 flex-row items-center px-1">
          <View
            className="flex-1 border-t border-dashed"
            style={{ borderColor: `${accent}59` }}
          />
          <View
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: accent }}
          >
            <Icon as={Redo} size={45} color="#ffffff" />
          </View>
          <View
            className="flex-1 border-t border-dashed"
            style={{ borderColor: `${accent}59` }}
          />
        </View>

        {renderPerson(receiver, 1, "receiver")}
      </View>

      {/* Details: message, schedule, place */}
      {hasDetails && (
        <View className="mx-4 mb-4 mt-3 gap-2.5 rounded-xl bg-muted/50 p-3">
          {request.message && (
            <View className="flex-row items-start gap-2 rounded-lg ">
              <Icon
                as={MessageCircle}
                size={16}
                color={accent}
                style={{ marginTop: 2 }}
              />
              <Text className="flex-1 text-sm italic text-foreground">
                &quot;{request?.message}&quot;
              </Text>
            </View>
          )}
          {requestTime && (
            <View className="flex-row items-center gap-2">
              <Icon as={Clock} size={16} color={mutedFg} />
              <Text className="text-xs text-muted-foreground">
                {toLongDateString(requestTime)} at {toTimeOnly(requestTime)}
              </Text>
            </View>
          )}
          {request?.location && (
            <View className="flex-row items-center gap-2">
              <Icon as={MapPin} size={16} color={mutedFg} />
              <Text
                className="flex-1 text-xs text-muted-foreground"
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
