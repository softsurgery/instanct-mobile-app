import { format } from "date-fns";
import { ImageBackground } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";

import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { ChatBubble } from "./conversation/ChatBubble";
import { ChatHeaderLeft } from "./conversation/ChatHeaderLeft";
import { ChatHeaderRight } from "./conversation/ChatHeaderRight";

import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import { ConversationInput } from "./conversation/ConversationInput";
import { useServerImages } from "@/hooks/content/useServerImages";
import { Text } from "~/components/ui/text";

import { useChatFeature } from "@/hooks/content/chat/useChatFeature";

interface ConversationProps {
  id: number;
}

export const Conversation = ({ id }: ConversationProps) => {
  const {
    conversation,
    isConversationPending,
    flattenedMessages,
    isInitialPending,
    isMoreMessagesLoading,

    input,
    setInput,
    sendMessage,
    loadMore,
  } = useChatFeature({ id });

  const preferencePersistStore = usePreferencePersistStore();
  const { currentUser } = useCurrentUser();

  const flatListRef = React.useRef<FlatList>(null);

  const user = React.useMemo(() => {
    if (!conversation || !currentUser) return null;
    return conversation.participants?.find(
      (participant) => participant.userId !== currentUser.id,
    )?.user;
  }, [conversation, currentUser]);

  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    fallbacks: [identifyUserAvatar(user)],
    wrapperClassName: "rounded-full border border-border",
    size: { width: 40, height: 40 },
    enabled: !!user?.pictureId,
  });

  const isLoading = isConversationPending || isInitialPending;

  return (
    <StableSafeAreaView className="flex-1 bg-card">
      {/* Background image - absolute so it doesn't shrink with keyboard */}
      {/* <ImageBackground
        source={
          preferencePersistStore.theme === "dark"
            ? require("~/assets/images/message-cover-dark.png")
            : require("~/assets/images/message-cover.png")
        }
        style={StyleSheet.absoluteFill}
      /> */}

      {/* HEADER */}
      <View className="flex flex-row justify-between items-center px-2 py-2.5 bg-card">
        <ChatHeaderLeft
          id={user?.id as string}
          profilePicture={profilePictures[0]}
          identifier={identifyUser(user)}
          lastSeen={format(new Date(), "hh:mm a")}
        />
        <ChatHeaderRight conversationId={id} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <View className="flex-1 bg-background">
          {/* MESSAGES */}
          {isLoading ? (
            <View className="flex-1 justify-center items-center gap-2">
              <ActivityIndicator size="large" />
              <Text className="text-sm text-muted-foreground">
                Loading conversation...
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={flattenedMessages}
              inverted
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingVertical: 16 }}
              keyExtractor={(item) =>
                item.type === "header" ? item.key : `m-${item.message.id}`
              }
              renderItem={({ item }) => {
                if (item.type === "header") {
                  return (
                    <View className="items-center py-3">
                      <View className="bg-card/80 px-4 py-1.5 rounded-full">
                        <Text className="text-xs font-semibold text-muted-foreground">
                          {item.date}
                        </Text>
                      </View>
                    </View>
                  );
                }

                return (
                  <ChatBubble
                    message={item.message.content}
                    timestamp={item.message.createdAt}
                    right={item.message.userId === currentUser?.id}
                  />
                );
              }}
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                isMoreMessagesLoading ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator size="small" />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center py-20">
                  <Text className="text-muted-foreground text-sm">
                    No messages yet. Say hello!
                  </Text>
                </View>
              }
            />
          )}

          {/* INPUT */}
          <ConversationInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
          />
        </View>
      </KeyboardAvoidingView>
    </StableSafeAreaView>
  );
};
