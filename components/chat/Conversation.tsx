import {
  differenceInCalendarDays,
  format,
  isToday,
  isYesterday,
} from "date-fns";
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
import { io, type Socket } from "socket.io-client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { ChatBubble } from "./conversation/ChatBubble";
import { ChatHeaderLeft } from "./conversation/ChatHeaderLeft";
import { ChatHeaderRight } from "./conversation/ChatHeaderRight";

import { api } from "~/api";

import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import { ResponseMessageDto } from "~/types";
import { ConversationInput } from "./conversation/ConversationInput";
import { useServerImages } from "@/hooks/content/useServerImages";
import { Text } from "~/components/ui/text";

import { useAudioPlayer } from "expo-audio";

interface ConversationProps {
  id: number;
}

const CHAT_SERVER_URL = process.env.EXPO_PUBLIC_API_SOCKET_URL;

type FlatListItem =
  | { type: "header"; date: string; key: string }
  | { type: "message"; message: ResponseMessageDto };

export const Conversation = ({ id }: ConversationProps) => {
  const queryClient = useQueryClient();
  const soundPlayer = useAudioPlayer(
    require("~/assets/sounds/receive-message.wav"),
  );

  const authPersistStore = useAuthPersistStore();
  const preferencePersistStore = usePreferencePersistStore();
  const { currentUser } = useCurrentUser();

  const socketRef = React.useRef<Socket | null>(null);
  const [messages, setMessages] = React.useState<ResponseMessageDto[]>([]);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [input, setInput] = React.useState("");
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const pageRef = React.useRef(1);
  const flatListRef = React.useRef<FlatList>(null);

  const { data: conversation, isPending: isConversationPending } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => api.chat.conversation.findById(id),
  });

  const user = React.useMemo(() => {
    if (!conversation || !currentUser) return null;
    return conversation.participants.find(
      (participant) => participant.id !== currentUser.id,
    );
  }, [conversation, currentUser]);

  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    fallbacks: [identifyUserAvatar(user)],
    wrapperClassName: "rounded-full border border-border",
    size: { width: 40, height: 40 },
    enabled: !!user?.pictureId,
  });

  // Play sound function
  const playSound = React.useCallback(async () => {
    try {
      await soundPlayer.play();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, [soundPlayer]);

  // -----------------------------
  // Message grouping by day
  // -----------------------------
  const groupMessagesByDay = React.useCallback(
    (msgs: ResponseMessageDto[]): FlatListItem[] => {
      if (msgs.length === 0) return [];

      const sorted = [...msgs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const grouped: Record<string, ResponseMessageDto[]> = {};
      sorted.forEach((msg) => {
        const dateKey = format(new Date(msg.createdAt), "yyyy-MM-dd");
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(msg);
      });

      return Object.entries(grouped).flatMap(([date, msgs]) => {
        const dateObj = new Date(date);
        let label: string;

        if (isToday(dateObj)) label = "Today";
        else if (isYesterday(dateObj)) label = "Yesterday";
        else {
          const diff = differenceInCalendarDays(new Date(), dateObj);
          if (diff <= 4) label = `${diff} days ago`;
          else label = format(dateObj, "MMMM dd, yyyy");
        }

        return [
          ...msgs.map((msg) => ({ type: "message" as const, message: msg })),
          { type: "header" as const, date: label, key: `header-${date}` },
        ];
      });
    },
    [],
  );

  const flattenedMessages = React.useMemo(
    () => groupMessagesByDay(messages),
    [messages, groupMessagesByDay],
  );

  // -----------------------------
  // Socket setup
  // -----------------------------
  React.useEffect(() => {
    const s = io(CHAT_SERVER_URL, {
      extraHeaders: {
        Authorization: `Bearer ${authPersistStore.accessToken}`,
      },
    });

    socketRef.current = s;

    s.on("connect", () => {
      s.emit("joinConversation", { conversationId: id });
      pageRef.current = 1;
      setLoadingMore(true);
      s.emit("getConversationMessages", {
        conversationId: id,
        limit: 20,
        page: "1",
      });
    });

    s.on("conversationMessages", (newMessages: ResponseMessageDto[]) => {
      if (newMessages.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const unique = newMessages.filter((m) => !existingIds.has(m.id));
          return [...prev, ...unique];
        });
      }
      setLoadingMore(false);
      setIsInitialLoading(false);
    });

    s.on("message", (message: ResponseMessageDto) => {
      setMessages((prev) => [message, ...prev]);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      playSound();
    });

    s.on("error", (err: any) => console.error("Socket error:", err));

    return () => {
      setMessages([]);
      socketRef.current = null;
      s.disconnect();
    };
  }, [id, authPersistStore.accessToken, queryClient, playSound]);

  // -----------------------------
  // Send message
  // -----------------------------
  const sendMessage = React.useCallback(() => {
    const s = socketRef.current;
    if (!input.trim() || !s) return;
    s.emit("message", { conversationId: id, content: input.trim() });
    setInput("");
  }, [input, id]);

  // -----------------------------
  // Infinite scroll
  // -----------------------------
  const handleLoadMore = React.useCallback(() => {
    const s = socketRef.current;
    if (loadingMore || !hasMore || messages.length === 0 || !s) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;

    setLoadingMore(true);
    s.emit("getConversationMessages", {
      conversationId: id,
      limit: 20,
      page: nextPage.toString(),
    });
  }, [loadingMore, hasMore, messages.length, id]);

  const isLoading = isConversationPending || isInitialLoading;

  return (
    <StableSafeAreaView className="flex-1 bg-card">
      {/* Background image - absolute so it doesn't shrink with keyboard */}
      <ImageBackground
        source={
          preferencePersistStore.theme === "dark"
            ? require("~/assets/images/message-cover-dark.png")
            : require("~/assets/images/message-cover.png")
        }
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER */}
      <View className="flex flex-row justify-between items-center px-2 py-2.5">
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
            contentContainerStyle={{ paddingVertical: 8 }}
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
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loadingMore ? (
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
      </KeyboardAvoidingView>
    </StableSafeAreaView>
  );
};
