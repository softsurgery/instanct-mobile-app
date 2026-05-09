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
  Text,
  View,
} from "react-native";
import { io } from "socket.io-client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { ChatBubble } from "./conversation/ChatBubble";
import { ChatHeaderLeft } from "./conversation/ChatHeaderLeft";
import { ChatHeaderRight } from "./conversation/ChatHeaderRight";

import { api } from "~/api";

import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { useDebounce } from "@/hooks/useDebounce";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import { ResponseMessageDto } from "~/types";
import { ConversationInput } from "./conversation/ConversationInput";
import { useServerImages } from "@/hooks/content/useServerImages";

import { useAudioPlayer } from "expo-audio";

interface ConversationProps {
  id: number;
}

const CHAT_SERVER_URL = process.env.EXPO_PUBLIC_API_SOCKET_URL;

type FlatListItem =
  | { type: "header"; date: string }
  | { type: "message"; message: ResponseMessageDto };

export const Conversation = ({ id }: ConversationProps) => {
  const queryClient = useQueryClient();
  const soundPlayer = useAudioPlayer(
    require("~/assets/sounds/receive-message.wav"),
  );

  const authPersistStore = useAuthPersistStore();
  const preferencePersistStore = usePreferencePersistStore();
  const { currentUser } = useCurrentUser();

  const [socket, setSocket] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<ResponseMessageDto[]>([]);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [input, setInput] = React.useState("");
  const [isInitialMessagesLoading, setIsInitialMessagesLoading] =
    React.useState(true);
  const [page, setPage] = React.useState(1);
  const { value: debouncedIsInitialMessagesLoading, loading: isLoading } =
    useDebounce(isInitialMessagesLoading, 1000);

  const { data: conversation, isPending: isConversationLoading } = useQuery({
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
      console.log("✅ Sound played");
    } catch (error) {
      console.error("❌ Error playing sound:", error);
    }
  }, [soundPlayer]);

  // -----------------------------
  // Message grouping by day
  // -----------------------------
  const groupMessagesByDay = React.useCallback(
    (msgs: ResponseMessageDto[]): FlatListItem[] => {
      // Sort messages descending
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

      // Create headers dynamically
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
          { type: "header" as const, date: label },
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
  // Load messages
  // -----------------------------
  const loadMessages = React.useCallback(
    (pageNum: number) => {
      if (!socket) return;
      setLoadingMore(true);
      socket.emit("getConversationMessages", {
        conversationId: id,
        limit: 20,
        page: pageNum.toString(),
      });
    },
    [socket, id],
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

    setSocket(s);

    s.on("connect", () => {
      console.log("✅ Connected to chat server");
      s.emit("joinConversation", { conversationId: id });
      setPage(1);
      loadMessages(1);
    });

    s.on("conversationMessages", (newMessages: ResponseMessageDto[]) => {
      if (newMessages.length === 0) setHasMore(false);
      else {
        setMessages((prev) => [...prev, ...newMessages]);
        playSound();
      }
      setLoadingMore(false);
      setIsInitialMessagesLoading(false);
    });

    s.on("message", (message: ResponseMessageDto) => {
      setMessages((prev) => [message, ...prev]);
      //has to be changed later to only invalidate the specific conversation query instead of all conversations
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      playSound();
    });

    s.on("error", (err: any) => console.log("❌ Socket error:", err));

    return () => {
      setMessages([]);
      s.disconnect();
    };
  }, [id]);

  // -----------------------------
  // Send message
  // -----------------------------
  const sendMessage = async () => {
    if (!input.trim() || !socket) return;
    socket.emit("message", { conversationId: id, content: input.trim() });
    setInput("");
    await playSound();
  };

  // -----------------------------
  // Infinite scroll
  // -----------------------------
  const handleLoadMore = () => {
    if (loadingMore || !hasMore || messages.length === 0) return;
    const nextPage = page + 1;
    setPage(nextPage);
    console.log("⏳ Loading messages - page:", nextPage);

    loadMessages(nextPage);
  };

  return (
    <StableSafeAreaView className="flex-1 bg-card">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ImageBackground
          source={
            preferencePersistStore.theme === "dark"
              ? require("~/assets/images/message-cover-dark.png")
              : require("~/assets/images/message-cover.png")
          }
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          {/* Header */}
          <View className="flex flex-row bg-card justify-between items-center">
            <ChatHeaderLeft
              id={user?.id as string}
              profilePicture={profilePictures[0]}
              identifier={identifyUser(user)}
              lastSeen={format(new Date(), "hh:mm a")}
            />
            <ChatHeaderRight conversationId={id} />
          </View>

          {/* Messages */}
          {isConversationLoading || debouncedIsInitialMessagesLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator />
              <Text className="text-foreground font-bold">
                Loading conversation...
              </Text>
            </View>
          ) : (
            <FlatList
              className="flex-1 py-4"
              inverted
              keyboardShouldPersistTaps="handled"
              data={flattenedMessages}
              keyExtractor={(item, index) =>
                item.type === "header"
                  ? `header-${item.date}`
                  : item.message.id.toString()
              }
              renderItem={({ item }) => {
                if (item.type === "header") {
                  return (
                    <View className="w-fit items-center py-2 my-1 mx-auto">
                      <Text className="text-sm font-bold text-foreground">
                        {item.date}
                      </Text>
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
              onEndReachedThreshold={0.2}
              ListFooterComponent={
                loadingMore ? (
                  <View className="py-2">
                    <ActivityIndicator />
                  </View>
                ) : null
              }
            />
          )}
          {/* Input */}
          <ConversationInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
          />
        </ImageBackground>
      </KeyboardAvoidingView>
    </StableSafeAreaView>
  );
};
