import { api } from "@/api";
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { ResponseMessageDto } from "@/types";
import { useAudioPlayer } from "expo-audio";
import {
  differenceInCalendarDays,
  format,
  isToday,
  isYesterday,
} from "date-fns";

const CHAT_SERVER_URL = process.env.EXPO_PUBLIC_API_SOCKET_URL;

type FlatListItem =
  | { type: "header"; date: string; key: string }
  | { type: "message"; message: ResponseMessageDto };

interface useChatFeatureProps {
  id: number;
}

export const useChatFeature = ({ id }: useChatFeatureProps) => {
  const soundPlayer = useAudioPlayer(
    require("~/assets/sounds/receive-message.wav"),
  );
  const queryClient = useQueryClient();

  const pageRef = React.useRef(1);
  const [messages, setMessages] = React.useState<ResponseMessageDto[]>([]);
  const [input, setInput] = React.useState("");

  const [hasMore, setHasMore] = React.useState(true);
  const [isInitialPending, setIsInitialPending] = React.useState(true);
  const [isMoreMessagesLoading, setIsMoreMessagesLoading] =
    React.useState(false);

  const socketRef = React.useRef<Socket | null>(null);

  const authPersistStore = useAuthPersistStore();

  const { data: conversation, isPending: isConversationPending } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () =>
      api.chat.conversation.findById(
        id,
        ["participants", "participants.user", "lastMessage"].join(","),
      ),
  });

  // Play sound function
  const playSound = React.useCallback(async () => {
    try {
      await soundPlayer.play();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, [soundPlayer]);

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

  React.useEffect(() => {
    const s = io(CHAT_SERVER_URL, {
      extraHeaders: {
        Authorization: `Bearer ${authPersistStore.accessToken}`,
      },
    });

    socketRef.current = s;
    s.on("connect", () => {
      s.emit("join-conversation", { conversationId: id });
      pageRef.current = 1;
      setIsMoreMessagesLoading(true);
      s.emit("get-conversation-messages", {
        conversationId: id,
        limit: 20,
        page: "1",
      });
      setIsInitialPending(true);
    });

    s.on("conversation-messages", (newMessages: ResponseMessageDto[]) => {
      if (newMessages.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const unique = newMessages.filter((m) => !existingIds.has(m.id));
          return [...prev, ...unique];
        });
      }
      setIsMoreMessagesLoading(false);
      setIsInitialPending(false);
    });

    s.on("message", (message: ResponseMessageDto) => {
      setMessages((prev) => [message, ...prev]);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      playSound();
    });

    s.on("error", (err: any) => {
      console.error("Socket error:", err);
      setIsMoreMessagesLoading(false);
      setIsInitialPending(false);
    });

    return () => {
      setMessages([]);
      s.disconnect();
    };
  }, [id, authPersistStore.accessToken]);

  // Send Message *******************************************************************************************************************
  const sendMessage = React.useCallback(() => {
    const s = socketRef.current;
    if (!input.trim() || !s) return;
    s.emit("message", { conversationId: id, content: input.trim() });
    setInput("");
  }, [input, id]);

  // Load More Messages *************************************************************************************************************
  const loadMore = React.useCallback(() => {
    const s = socketRef.current;
    if (isMoreMessagesLoading || !hasMore || messages.length === 0 || !s)
      return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;

    setIsMoreMessagesLoading(true);
    s.emit("get-conversation-messages", {
      conversationId: id,
      limit: 20,
      page: nextPage.toString(),
    });
  }, [isMoreMessagesLoading, hasMore, messages.length, id]);

  const flattenedMessages = React.useMemo(
    () => groupMessagesByDay(messages),
    [messages, groupMessagesByDay],
  );

  return {
    conversation,
    flattenedMessages,
    loadMore,
    isConversationPending,
    isInitialPending,
    isMoreMessagesLoading,

    input,
    setInput,
    sendMessage,
  };
};
