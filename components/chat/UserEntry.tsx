import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { MessageCircleMoreIcon } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { ResponseUserDto } from "~/types";
import { Icon } from "../ui/icon";
import { useServerImages } from "@/hooks/content/useServerImages";
import { differenceInCalendarDays } from "date-fns";

interface UserCardProps {
  className?: string;
  user: ResponseUserDto;
  lastMessage?: string;
  sentAt?: string;
  isPending?: boolean;
}

export const UserEntry = ({
  className,
  user,
  lastMessage,
  sentAt,
  isPending,
}: UserCardProps) => {
  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    fallbacks: [identifyUserAvatar(user)],
    size: { width: 60, height: 60 },
  });

  const seen = React.useMemo(() => {
    if (!sentAt) return false;

    const sentDate = new Date(sentAt);
    const now = new Date();

    return differenceInCalendarDays(now, sentDate) === 0;
  }, [sentAt]);

  return (
    <View
      className={cn(
        "w-full flex-row items-center justify-between rounded-2xl px-3 py-3",
        className,
      )}
    >
      {/* Left Content */}
      <View className="flex-1 flex-row items-center gap-3">
        {/* Avatar */}
        <View className="overflow-hidden rounded-full">
          {profilePictures[0]}
        </View>

        {/* Text Content */}
        <View className="flex-1">
          {/* Top Row */}
          <View className="flex-row items-center justify-between gap-4">
            <Text
              className="flex-1 text-base font-semibold text-black dark:text-white"
              numberOfLines={1}
            >
              {identifyUser(user)}
            </Text>

            {!!sentAt && (
              <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                {sentAt}
              </Text>
            )}
          </View>

          {/* Bottom Row */}
          <View className="mt-1 flex-row items-center justify-between gap-4">
            <Text
              className={cn(
                "flex-1 text-sm",
                lastMessage
                  ? "text-gray-600 dark:text-gray-300"
                  : "text-primary font-medium",
              )}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {lastMessage
                ? lastMessage.replaceAll("\n", " ").replace(/\s+/g, " ").trim()
                : "Start a conversation"}
            </Text>

            {/* Status */}
            <View className="flex-row items-center gap-1">
              {isPending && (
                <View className="h-2 w-2 rounded-full bg-orange-400" />
              )}

              {seen && (
                <Icon
                  as={MessageCircleMoreIcon}
                  size={16}
                  className="text-primary"
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
