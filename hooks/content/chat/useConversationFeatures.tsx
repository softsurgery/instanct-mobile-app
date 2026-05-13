import { api } from "@/api";
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type Socket } from "socket.io-client";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { ResponseMessageDto } from "@/types";
import { useAudioPlayer } from "expo-audio";
import {
  differenceInCalendarDays,
  format,
  isToday,
  isYesterday,
} from "date-fns";
import { getSocket } from "@/lib/socket";

type FlatListItem =
  | { type: "header"; date: string; key: string }
  | { type: "message"; message: ResponseMessageDto };

interface useConversationFeaturesProps {
  id: number;
  limit?: number;
  enabled?: boolean;
}

export const useConversationFeatures = ({
  id,
  limit = 20,
  enabled = true,
}: useConversationFeaturesProps) => {
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
    enabled: !!id && enabled,
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
    const s = getSocket("chat", { token: authPersistStore.accessToken });
    socketRef.current = s;

    const joinAndFetch = () => {
      s.emit("join-conversation", { conversationId: id });
      pageRef.current = 1;
      setIsMoreMessagesLoading(true);
      setIsInitialPending(true);
    };

    const onConnect = () => {
      joinAndFetch();
    };

    const onConversationMessages = (newMessages: ResponseMessageDto[]) => {
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
    };

    const onMessage = (message: ResponseMessageDto) => {
      setMessages((prev) => [message, ...prev]);
      playSound();
    };

    const onError = (err: any) => {
      console.error("Socket error:", err);
      setIsMoreMessagesLoading(false);
      setIsInitialPending(false);
    };

    s.on("connect", onConnect);
    s.on("conversation-messages", onConversationMessages);
    s.on("message", onMessage);
    s.on("error", onError);

    // If already connected, join immediately instead of waiting for "connect"
    if (s.connected) {
      joinAndFetch();
    }

    return () => {
      s.off("connect", onConnect);
      s.off("conversation-messages", onConversationMessages);
      s.off("message", onMessage);
      s.off("error", onError);
      setMessages([]);
    };
  }, [id, authPersistStore.accessToken, limit, enabled, playSound]);

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
      page: nextPage.toString(),
      limit,
      conversationId: id,
    });
  }, [isMoreMessagesLoading, hasMore, messages.length, id, limit]);

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
