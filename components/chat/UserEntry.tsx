import { identifyUser, identifyUserAvatar } from "@/lib/user";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import {
  MessageVariant,
  ResponseConversationDto,
  StaticMessageEnum,
} from "~/types";
import { useServerImages } from "@/hooks/content/useServerImages";
import { differenceInMilliseconds } from "date-fns";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { formatSmartDate } from "@/lib/date";
import { useUserPresence } from "@/hooks/content/chat/useUserPresence";

interface UserCardProps {
  className?: string;
  conversation: ResponseConversationDto;
  isPending?: boolean;
}

/**
 * Component displaying an individual conversation row item in the conversation list,
 * including participant avatar, online badge, unread count, and last message snippet.
 */
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

  const { isOnline } = useUserPresence({ userId: user?.id });

  const lastMessage = conversation.lastMessage;

  const lastCheck = React.useMemo(
    () =>
      conversation.participants.find((p) => p.userId === currentUser?.id)
        ?.lastCheck,
    [conversation.participants, currentUser?.id],
  );

  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    className: "rounded-full",
    fallbacks: [identifyUserAvatar(user)],
    size: { width: 60, height: 60 },
  });

  const seen = React.useMemo(() => {
    if (!lastCheck || !lastMessage?.createdAt) return false;

    return (
      differenceInMilliseconds(
        new Date(lastCheck),
        new Date(lastMessage?.createdAt),
      ) >= 0
    );
  }, [lastCheck, lastMessage?.createdAt]);

  const messagePreview = React.useMemo(() => {
    if (!lastMessage) {
      return (
        <Text
          className="flex-1 text-sm font-bold text-primary"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Start a conversation 👋
        </Text>
      );
    }

    const isMe = lastMessage.userId === currentUser?.id;
    const prefix =
      isMe && lastMessage.static !== StaticMessageEnum.FIRST_MESSAGE
        ? "You: "
        : "";

    const defaultStyle = cn(
      "flex-1 text-sm",
      seen
        ? "text-gray-500 dark:text-gray-400 font-normal"
        : "font-bold text-black dark:text-white",
    );

    if (lastMessage?.variant === MessageVariant.STATIC) {
      if (lastMessage?.static === StaticMessageEnum.FIRST_MESSAGE) {
        return (
          <Text
            className="flex-1 text-sm font-bold text-primary"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Start a conversation 👋
          </Text>
        );
      }
      if (lastMessage?.static === StaticMessageEnum.POKE) {
        return (
          <Text
            className="flex-1 text-sm font-bold text-primary"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {isMe ? "👉 You poked them" : "👈 Poked you"}
          </Text>
        );
      }
    }

    const mediaCount = lastMessage.uploads?.length || 1;

    if (lastMessage?.variant === MessageVariant.IMAGE) {
      const label = mediaCount === 1 ? "📷 Image" : `📷 ${mediaCount} photos`;
      return (
        <Text className={defaultStyle} numberOfLines={1} ellipsizeMode="tail">
          {prefix}
          {label}
        </Text>
      );
    }

    if (lastMessage?.variant === MessageVariant.VIDEO) {
      const label = mediaCount === 1 ? "🎥 Video" : `🎥 ${mediaCount} videos`;
      return (
        <Text className={defaultStyle} numberOfLines={1} ellipsizeMode="tail">
          {prefix}
          {label}
        </Text>
      );
    }

    if (lastMessage?.variant === MessageVariant.FILE) {
      const label = mediaCount === 1 ? "📎 File" : `📎 ${mediaCount} files`;
      return (
        <Text className={defaultStyle} numberOfLines={1} ellipsizeMode="tail">
          {prefix}
          {label}
        </Text>
      );
    }

    if (lastMessage?.variant === MessageVariant.EMOJI) {
      return (
        <Text className={defaultStyle} numberOfLines={1} ellipsizeMode="tail">
          {prefix}
          {lastMessage?.content}
        </Text>
      );
    }

    const text =
      lastMessage?.content
        ?.replaceAll("\n", " ")
        ?.replace(/\s+/g, " ")
        ?.trim() || "";
    return (
      <Text className={defaultStyle} numberOfLines={1} ellipsizeMode="tail">
        {prefix}
        {text}
      </Text>
    );
  }, [lastMessage, currentUser?.id, seen]);

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
        <View className="relative">
          {profilePictures[0]}
          {isOnline && (
            <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-card rounded-full" />
          )}
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
                {formatSmartDate(lastMessage?.createdAt)}
              </Text>
            )}
          </View>

          {/* Bottom Row */}
          <View className="mt-1 flex-row items-center justify-between gap-4">
            {messagePreview}

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
