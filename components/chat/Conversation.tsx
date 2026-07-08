import { formatDistanceToNow } from "date-fns";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  View,
  Pressable,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useFocusEffect } from "expo-router";

import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { ChatBubble } from "./conversation/bubbles/ChatBubble";
import { ChatMediaBubble } from "./conversation/bubbles/ChatMediaBubble";
import { ChatFileBubble } from "./conversation/bubbles/ChatFileBubble";
import { ChatHeaderLeft } from "./conversation/ChatHeaderLeft";
import { ChatHeaderRight } from "./conversation/ChatHeaderRight";
import { SeenMessageWrapper } from "./conversation/SeenMessageWrapper";

import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { ConversationInput } from "./conversation/input/ConversationInput";
import { ConversationMediaStaging } from "./conversation/staging/ConversationMediaStaging";
import { useServerImages } from "@/hooks/content/useServerImages";
import { Text } from "~/components/ui/text";

import { useConversationFeatures } from "@/hooks/content/chat/useConversationFeatures";
import { useLastSeenMessageId } from "@/hooks/content/chat/useLastSeenMessageId";
import { useSendChatMedia } from "@/hooks/content/chat/useSendChatMedia";
import { useSendChatFile } from "@/hooks/content/chat/useSendChatFile";
import { useUserPresence } from "@/hooks/content/chat/useUserPresence";
import { ImageBackground } from "expo-image";
import { ChatStaticBubble } from "./conversation/bubbles/ChatStaticBubble";
import { ConversationMessagesSkeleton } from "./conversation/ConversationMessagesSkeleton";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useGradualAnimation } from "@/hooks/useGradualAnimation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageFlatListItem } from "@/types";
import { useColorPalette } from "@/hooks/useColorPalette";

interface ConversationProps {
  id: number;
  userId?: string;
  identifier?: string;
  pictureId?: string;
  avatarFallback?: string;
}

export const Conversation = ({
  id,
  userId,
  identifier,
  pictureId,
  avatarFallback,
}: ConversationProps) => {
  const { colorScheme, palette } = useColorPalette();
  const { height } = useGradualAnimation();
  const insets = useSafeAreaInsets();

  const fakeView = useAnimatedStyle(() => {
    return {
      height:
        Platform.OS === "ios"
          ? height.value
          : Math.max(Math.abs(height.value) - insets.bottom, 0),
    };
  }, [insets.bottom]);

  const {
    conversation,
    flattenedMessages,
    messages,
    isInitialPending,
    isMoreMessagesLoading,

    input,
    setInput,
    sendMessage,
    sendPoke,
    sendMediaMessage,
    sendFileMessage,
    pendingTextMessages,
    loadMore,
    markConversationAsSeen,
  } = useConversationFeatures({ id });

  const {
    pickImage,
    pickVideo,
    stagedMedia,
    pendingUploads,
    confirmSendStagedMedia,
    cancelStagedMedia,
    removeStagedMedia,
    addMoreStagedMedia,
  } = useSendChatMedia({
    conversationId: id,
    messages,
    onSend: sendMediaMessage,
  });

  const { pickFile, pendingUploads: pendingFileUploads } = useSendChatFile({
    conversationId: id,
    messages,
    onSend: sendFileMessage,
  });

  const { currentUser } = useCurrentUser();

  useFocusEffect(
    React.useCallback(() => {
      markConversationAsSeen();
    }, [markConversationAsSeen]),
  );

  const lastSeenMessageId = useLastSeenMessageId({
    conversation,
    messages,
    currentUserId: currentUser?.id,
  });

  const flatListRef = React.useRef<FlatList>(null);
  const [showScrollDown, setShowScrollDown] = React.useState(false);
  const scrollDownOpacity = useSharedValue(0);

  React.useEffect(() => {
    scrollDownOpacity.value = withTiming(showScrollDown ? 1 : 0, {
      duration: 200,
    });
  }, [showScrollDown, scrollDownOpacity]);

  const animatedScrollDownStyle = useAnimatedStyle(() => {
    return {
      opacity: scrollDownOpacity.value,
      transform: [
        {
          translateY: withTiming(showScrollDown ? 0 : 20, { duration: 200 }),
        },
      ],
    };
  });

  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const shouldShow = offsetY > 200;
      if (shouldShow !== showScrollDown) {
        setShowScrollDown(shouldShow);
      }
    },
    [showScrollDown],
  );

  const scrollToBottom = React.useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const user = React.useMemo(() => {
    if (!conversation || !currentUser) return null;
    return conversation.participants?.find(
      (participant) => participant.userId !== currentUser.id,
    )?.user;
  }, [conversation, currentUser]);

  const headerUserId = user?.id ?? userId;
  const headerIdentifier = user
    ? identifyUser(user)
    : (identifier ?? "");
  const headerPictureId =
    user?.pictureId ??
    (pictureId ? Number(pictureId) : undefined);
  const headerAvatarFallback = user
    ? identifyUserAvatar(user)
    : (avatarFallback ?? "?");

  const { jsxArray: profilePictures } = useServerImages({
    ids: [headerPictureId],
    fallbacks: [headerAvatarFallback],
    className: "rounded-full",
    wrapperClassName: "rounded-full border border-border",
    size: { width: 40, height: 40 },
  });

  const { isOnline, lastSeen } = useUserPresence({ userId: headerUserId });

  const presenceText = React.useMemo(() => {
    if (isOnline) return "Online";
    if (lastSeen) return formatDistanceToNow(lastSeen, { addSuffix: true });
    return "";
  }, [isOnline, lastSeen]);

  const listData = React.useMemo(() => {
    const pendingTextItems = pendingTextMessages.map(
      (pending): MessageFlatListItem => ({
        type: "pending-text",
        key: pending.clientId,
        pending,
      }),
    );
    const pendingMediaItems = pendingUploads.map(
      (pending): MessageFlatListItem => ({
        type: "pending-media",
        key: pending.clientId,
        pending,
      }),
    );
    const pendingFileItems = pendingFileUploads.map(
      (pending): MessageFlatListItem => ({
        type: "pending-file",
        key: pending.clientId,
        pending,
      }),
    );
    return [
      ...pendingTextItems,
      ...pendingFileItems,
      ...pendingMediaItems,
      ...flattenedMessages,
    ];
  }, [
    pendingTextMessages,
    pendingUploads,
    pendingFileUploads,
    flattenedMessages,
  ]);

  const isMessagesLoading = isInitialPending;

  return (
    <StableSafeAreaView className="flex-1 bg-card">
      {/* HEADER */}
      <View className="flex flex-row justify-between items-center px-2 py-1 bg-card border-b border-border">
        <ChatHeaderLeft
          id={headerUserId as string}
          profilePicture={profilePictures[0]}
          identifier={headerIdentifier}
          lastSeen={presenceText}
          isOnline={isOnline}
        />
        <ChatHeaderRight conversationId={id} />
      </View>

      <ImageBackground
        source={
          colorScheme === "dark"
            ? require("~/assets/images/message-background-dark.png")
            : require("~/assets/images/message-background.png")
        }
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
        }}
        imageStyle={{ opacity: colorScheme === "dark" ? 0.3 : 1 }}
      >
        <View style={{ flex: 1 }}>
          {/* MESSAGES */}
          {!isMessagesLoading ? (
            <View style={{ flex: 1 }}>
              <FlatList
                ref={flatListRef}
                data={listData}
                inverted
                contentContainerStyle={{ paddingVertical: 16 }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={(item) =>
                  item.type === "header"
                    ? item.key
                    : item.type === "pending-media" ||
                        item.type === "pending-file" ||
                        item.type === "pending-text"
                      ? item.key
                      : `m-${item.message.id}`
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

                  if (item.type === "pending-media")
                    return <ChatMediaBubble pending={item.pending} right />;

                  if (item.type === "pending-file")
                    return <ChatFileBubble pending={item.pending} right />;

                  if (item.type === "pending-text")
                    return (
                      <ChatBubble
                        message={item.pending.content}
                        timestamp={item.pending.createdAt}
                        right
                        isPending
                      />
                    );

                  if (item.type === "message") {
                    const isOwnMessage = item.message.userId === currentUser?.id;
                    const showSeen =
                      isOwnMessage && item.message.id === lastSeenMessageId;

                    return (
                      <SeenMessageWrapper
                        showSeen={showSeen}
                        pictureId={headerPictureId}
                        avatarFallback={headerAvatarFallback}
                      >
                        <ChatBubble
                          message={item.message.content}
                          timestamp={item.message.createdAt}
                          right={isOwnMessage}
                        />
                      </SeenMessageWrapper>
                    );
                  }

                  if (item.type === "media") {
                    const isOwnMessage = item.message.userId === currentUser?.id;
                    const showSeen =
                      isOwnMessage && item.message.id === lastSeenMessageId;

                    return (
                      <SeenMessageWrapper
                        showSeen={showSeen}
                        pictureId={headerPictureId}
                        avatarFallback={headerAvatarFallback}
                      >
                        <ChatMediaBubble
                          message={item.message}
                          right={isOwnMessage}
                        />
                      </SeenMessageWrapper>
                    );
                  }

                  if (item.type === "file") {
                    const isOwnMessage = item.message.userId === currentUser?.id;
                    const showSeen =
                      isOwnMessage && item.message.id === lastSeenMessageId;

                    return (
                      <SeenMessageWrapper
                        showSeen={showSeen}
                        pictureId={headerPictureId}
                        avatarFallback={headerAvatarFallback}
                      >
                        <ChatFileBubble
                          message={item.message}
                          right={isOwnMessage}
                        />
                      </SeenMessageWrapper>
                    );
                  }

                  return <ChatStaticBubble message={item.message} />;
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
              <Animated.View
                pointerEvents={showScrollDown ? "auto" : "none"}
                style={[
                  {
                    position: "absolute",
                    right: "45%",
                    bottom: 16,
                    zIndex: 50,
                  },
                  animatedScrollDownStyle,
                ]}
              >
                <Pressable
                  onPress={scrollToBottom}
                  className="bg-card border border-border w-10 h-10 rounded-full items-center justify-center shadow-md active:bg-secondary"
                >
                  <ChevronDown size={20} color={palette.foreground} />
                </Pressable>
              </Animated.View>
            </View>
          ) : (
            <ConversationMessagesSkeleton />
          )}

          {/* INPUT */}
          <ConversationInput
            className="bg-card"
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            sendPoke={sendPoke}
            onPickImage={pickImage}
            onPickVideo={pickVideo}
            onPickFile={pickFile}
            isConversationLocked={!!conversation?.locked}
          />
          <Animated.View style={fakeView} />
        </View>
      </ImageBackground>

      <ConversationMediaStaging
        stagedMedia={stagedMedia}
        onConfirm={confirmSendStagedMedia}
        onCancel={cancelStagedMedia}
        onRemove={removeStagedMedia}
        onAddMore={addMoreStagedMedia}
      />
    </StableSafeAreaView>
  );
};
