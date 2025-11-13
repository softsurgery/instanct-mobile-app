import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { MessageCircleMoreIcon } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useServerImage } from "~/hooks/content/useServerImage";
import { cn } from "~/lib/utils";
import { ResponseClientDto } from "~/types";
import { Icon } from "../ui/icon";

interface UserCardProps {
  className?: string;
  user: ResponseClientDto;
  lastMessage?: string;
  sentAt?: string;
  seen?: boolean;
  isPending?: boolean;
}

export const UserEntry = ({
  className,
  user,
  lastMessage,
  sentAt,
  seen,
  isPending,
}: UserCardProps) => {
  const { jsx: profilePicture } = useServerImage({
    id: user.profile?.pictureId,
    fallback: identifyUserAvatar(user),
    size: { width: 60, height: 60 },
  });
  return (
    <View
      className={cn(
        "flex flex-row justify-between items-center gap-2 w-full",
        className
      )}
    >
      <View className="flex flex-row gap-2 items-center">
        {profilePicture}
        <View className="flex flex-col justify-between items-start">
          <Text className="text-lg font-semibold">{identifyUser(user)}</Text>
          <View className="flex flex-row gap-2 items-center">
            {!!lastMessage ? (
              <Text
                className="text-xs font-semibold"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {lastMessage.replaceAll("\n", " ").replace("  ", " ")}
              </Text>
            ) : (
              <Text className="text-xs font-poppins-bold">
                You can start a conversation now
              </Text>
            )}
            {!!lastMessage && (
              <Text className="text-xs font-thin">{sentAt}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Message Row */}
      {seen && (
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          <Icon as={MessageCircleMoreIcon} />
        </Text>
      )}
    </View>
  );
};
