import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { ResponseMessageDto, ResponseUserDto } from "~/types";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { MessageTextContent } from "../bubbles/MessageTextContent";
import { useServerImages } from "@/hooks/content/useServerImages";

interface SearchResultAvatarProps {
  user?: ResponseUserDto | null;
}

const SearchResultAvatar = ({ user }: SearchResultAvatarProps) => {
  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    className: "rounded-full",
    wrapperClassName: "rounded-full border border-border overflow-hidden",
    fallbacks: [identifyUserAvatar(user)],
    size: { width: 32, height: 32 },
  });

  return <View className="mr-3 mt-1">{profilePictures[0]}</View>;
};

interface ConversationSearchResultItemProps {
  message: ResponseMessageDto;
  searchQuery: string;
  onPress: () => void;
}

export const ConversationSearchResultItem = ({
  message,
  searchQuery,
  onPress,
}: ConversationSearchResultItemProps) => {
  const senderName = identifyUser(message.user);
  const content = message.content || "";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="px-4 py-3 border-b border-border active:bg-muted/30"
    >
      <View className="flex-row items-start">
        <SearchResultAvatar user={message.user} />
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-foreground font-medium mr-2">
              {senderName}
            </Text>
            <Text className="text-muted-foreground text-xs">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <MessageTextContent
            content={content}
            links={message.links}
            highlightQuery={searchQuery}
            className="text-foreground"
            linkClassName="text-primary font-medium"
            highlightClassName="bg-accent font-semibold"
          />
          <Text className="text-muted-foreground text-xs mt-2">
            {new Date(message.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
