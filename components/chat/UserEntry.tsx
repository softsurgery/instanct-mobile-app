import { identifyUser, identifyUserAvatar } from "@/lib/user";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { ResponseConversationDto } from "~/types";
import { useServerImages } from "@/hooks/content/useServerImages";
import { differenceInMilliseconds, format } from "date-fns";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";

interface UserCardProps {
  className?: string;
  conversation: ResponseConversationDto;
  isPending?: boolean;
}

export const UserEntry = ({
  className,
  conversation,
  isPending,
}: UserCardProps) => {
  const { currentUser } = useCurrentUser();
  const user = React.useMemo(
    () =>
      conversation.participants.find((p) => p.userId !== currentUser?.id)?.user,
    [conversation.participants, currentUser?.id],
  );

  const lastMessage = conversation.lastMessage;

  const lastCheck = React.useMemo(
    () =>
      conversation.participants.find((p) => p.userId === currentUser?.id)
        ?.lastCheck,
    [conversation.participants, currentUser?.id],
  );

  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    fallbacks: [identifyUserAvatar(user)],
    size: { width: 60, height: 60 },
  });

  const seen = React.useMemo(() => {
    if (!lastCheck || !lastMessage?.createdAt) return false;

    return (
      differenceInMilliseconds(
        new Date(lastCheck),
        new Date(lastMessage.createdAt),
      ) >= 0
    );
  }, [lastCheck, lastMessage?.createdAt]);

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

            {!!lastMessage && (
              <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                {format(lastMessage.createdAt, "dd/MM/yyyy hh:mm a")}
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
                  : "text-primary font-bold",
                seen ? "font-base" : "font-bold",
              )}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {lastMessage
                ? lastMessage.content
                    .replaceAll("\n", " ")
                    .replace(/\s+/g, " ")
                    .trim()
                : "You can send a message to start the conversation"}
            </Text>

            {/* Status */}
            <View className="flex-row items-center gap-1">
              {isPending && (
                <View className="h-2 w-2 rounded-full bg-orange-400" />
              )}
            </View>
            {!seen && lastMessage && (
              <View className="h-4 w-4 rounded-full bg-primary" />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
