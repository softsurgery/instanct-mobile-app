import { api } from "@/api";
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type Socket } from "socket.io-client";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import {
  MessageFlatListItem,
  MessageVariant,
  ResponseConversationDto,
  ResponseMessageDto,
  StaticMessageEnum,
} from "@/types";
import { useAudioPlayer } from "expo-audio";
import {
  differenceInCalendarDays,
  format,
  isToday,
  isYesterday,
} from "date-fns";
import { getSocket } from "@/lib/socket";
import { CONVERSATION_LIST_JOIN, replaceConversationInPages } from "@/lib/chat";
import { useCurrentUser } from "../users/useCurrentUser";
import { useChatPendingStore } from "@/stores/useChatPendingStore";
import { useShallow } from "zustand/react/shallow";

interface useConversationFeaturesProps {
  id: number;
  limit?: number;
  enabled?: boolean;
}

/**
 * Cached messages structure stored in React Query.
 * Mirrors the pattern used in useChat for conversations.
 */
interface CachedConversationMessages {
  messages: ResponseMessageDto[];
  hasMore: boolean;
  currentPage: number;
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
  const [input, setInput] = React.useState("");

  const pendingTextMessages = useChatPendingStore(
    useShallow((state) =>
      state.pendingTextMessages.filter(
        (pending) => pending.conversationId === id,
      ),
    ),
  );
  const addPendingText = useChatPendingStore((state) => state.addPendingText);
  const enqueueSentText = useChatPendingStore((state) => state.enqueueSentText);
  const reconcileTextPending = useChatPendingStore(
    (state) => state.reconcileTextPending,
  );

  const socketRef = React.useRef<Socket | null>(null);
  const currentUserIdRef = React.useRef<string | undefined>(undefined);
  const authPersistStore = useAuthPersistStore();
  const { currentUser } = useCurrentUser();

  React.useEffect(() => {
    currentUserIdRef.current = currentUser?.id;
  }, [currentUser?.id]);

  // ----- Query key for this conversation's messages -----
  const messagesQueryKey = React.useMemo(
    () => ["conversation-messages", id],
    [id],
  );

  const defaultCacheValue: CachedConversationMessages = React.useMemo(
    () => ({ messages: [], hasMore: true, currentPage: 0 }),
    [],
  );

  // ----- Subscribe to cached messages via useQuery (ensures re-renders on setQueryData) -----
  const { data: cachedData } = useQuery<CachedConversationMessages>({
    queryKey: messagesQueryKey,
    queryFn: () => defaultCacheValue,
    enabled: false,
    initialData: () =>
      queryClient.getQueryData<CachedConversationMessages>(messagesQueryKey),
  });

  const messages = React.useMemo(
    () => cachedData?.messages ?? [],
    [cachedData],
  );
  const hasMore = cachedData?.hasMore ?? true;
  const currentPage = cachedData?.currentPage ?? 0;

  React.useEffect(() => {
    if (!currentUser?.id) return;
    reconcileTextPending(id, messages, currentUser.id);
  }, [id, messages, currentUser?.id, reconcileTextPending]);

  // ----- Helper to check if cache has real data -----
  const getCachedMessages = React.useCallback(():
    | CachedConversationMessages
    | undefined => {
    return queryClient.getQueryData<CachedConversationMessages>(
      messagesQueryKey,
    );
  }, [queryClient, messagesQueryKey]);

  // ----- Helper to set cached messages -----
  const setCachedMessages = React.useCallback(
    (
      updater: (
        prev: CachedConversationMessages | undefined,
      ) => CachedConversationMessages,
    ) => {
      queryClient.setQueryData<CachedConversationMessages>(
        messagesQueryKey,
        updater,
      );
    },
    [queryClient, messagesQueryKey],
  );

  // ----- Loading states (still local, UI-only) -----
  const [isInitialPending, setIsInitialPending] = React.useState(() => {
    const cached = getCachedMessages();
    return !cached?.messages?.length;
  });
  const [isMoreMessagesLoading, setIsMoreMessagesLoading] =
    React.useState(false);

  const { data: conversation, isPending: isConversationPending } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () =>
      api.chat.conversation.findById(id, CONVERSATION_LIST_JOIN),
    enabled: !!id && enabled,
  });

  // Play sound function
  const playSound = React.useCallback(async () => {
    try {
      soundPlayer.seekTo(0);
      await soundPlayer.play();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, [soundPlayer]);

  const groupMessagesByDay = React.useCallback(
    (msgs: ResponseMessageDto[]): MessageFlatListItem[] => {
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
          ...msgs.map((msg): MessageFlatListItem => {
            if (msg.variant === MessageVariant.TEXT) {
              return { type: "message", message: msg };
            }
            if (
              msg.variant === MessageVariant.IMAGE ||
              msg.variant === MessageVariant.VIDEO
            ) {
              return { type: "media", message: msg };
            }
            return { type: "static", message: msg };
          }),
          { type: "header" as const, date: label, key: `header-${date}` },
        ];
      });
    },
    [],
  );

  React.useEffect(() => {
    const s = getSocket("chat", { token: authPersistStore.accessToken });
    socketRef.current = s;

    const existingCache = getCachedMessages();

    const joinAndFetch = () => {
      s.emit("join-conversation", { conversationId: id });

      // Fetch messages when cache is empty
      if (!existingCache?.messages?.length) {
        setIsMoreMessagesLoading(true);
        setIsInitialPending(true);
      } else {
        setIsInitialPending(false);
        setIsMoreMessagesLoading(false);
      }
    };

    const markConversationAsSeen = () => {
      s.emit("see-conversation", { conversationId: id });
    };

    const onConnect = () => {
      joinAndFetch();
      markConversationAsSeen();
    };

    const onConversationMessages = (newMessages: ResponseMessageDto[]) => {
      if (newMessages.length === 0) {
        setCachedMessages((prev) => ({
          messages: prev?.messages ?? [],
          hasMore: false,
          currentPage: prev?.currentPage ?? 1,
        }));
      } else {
        setCachedMessages((prev) => {
          const existing = prev?.messages ?? [];
          const existingIds = new Set(existing.map((m) => m.id));
          const unique = newMessages.filter((m) => !existingIds.has(m.id));
          return {
            messages: [...existing, ...unique],
            hasMore: prev?.hasMore ?? true,
            currentPage: prev?.currentPage ?? 1,
          };
        });
      }
      setIsMoreMessagesLoading(false);
      setIsInitialPending(false);
    };

    const onMessage = (message: ResponseMessageDto) => {
      setCachedMessages((prev) => {
        const existing = prev?.messages ?? [];
        if (existing.some((item) => item.id === message.id)) {
          return prev ?? {
            messages: existing,
            hasMore: true,
            currentPage: 1,
          };
        }

        return {
          messages: [message, ...existing],
          hasMore: prev?.hasMore ?? true,
          currentPage: prev?.currentPage ?? 1,
        };
      });

      if (
        message.variant === MessageVariant.IMAGE ||
        message.variant === MessageVariant.VIDEO
      ) {
        queryClient.setQueriesData(
          {
            queryKey: [
              "messages",
              [MessageVariant.IMAGE, MessageVariant.VIDEO],
              id,
            ],
          },
          (oldData: any) => {
            if (!oldData || !oldData.pages) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any, index: number) => {
                if (index === 0) {
                  return {
                    ...page,
                    data: [message, ...page.data],
                  };
                }
                return page;
              }),
            };
          },
        );
      }

      playSound();

      if (message.userId !== currentUserIdRef.current) {
        markConversationAsSeen();
      }
    };

    const onError = (err: any) => {
      console.error("Socket error:", err);
      setIsMoreMessagesLoading(false);
      setIsInitialPending(false);
    };

    const onConversationUpdatedLastCheck = (
      updated: ResponseConversationDto,
    ) => {
      if (updated.id !== id) return;

      queryClient.setQueryData(["conversation", id], updated);
      queryClient.setQueriesData({ queryKey: ["conversations"] }, (oldData) =>
        replaceConversationInPages(oldData as any, updated),
      );
    };

    s.on("connect", onConnect);
    s.on("conversation-messages", onConversationMessages);
    s.on("message", onMessage);
    s.on("error", onError);
    s.on("conversation-updated-last-check", onConversationUpdatedLastCheck);

    // If already connected, join immediately instead of waiting for "connect"
    if (s.connected) {
      joinAndFetch();
    }

    markConversationAsSeen();

    return () => {
      s.off("connect", onConnect);
      s.off("conversation-messages", onConversationMessages);
      s.off("message", onMessage);
      s.off("error", onError);
      s.off(
        "conversation-updated-last-check",
        onConversationUpdatedLastCheck,
      );
      // Do NOT clear the cache on unmount — that's the whole point
    };
  }, [
    id,
    authPersistStore.accessToken,
    limit,
    enabled,
    playSound,
    getCachedMessages,
    setCachedMessages,
    queryClient,
  ]);

  // Send Message *******************************************************************************************************************
  const sendMessage = React.useCallback(() => {
    const s = socketRef.current;
    const trimmed = input.trim();
    if (!trimmed || !s) return;

    const clientId = `text-${Date.now()}-${Math.random()}`;
    enqueueSentText(id, clientId);
    addPendingText({
      clientId,
      conversationId: id,
      content: trimmed,
      createdAt: new Date(),
      status: "pending",
    });

    s.emit("message", {
      conversationId: id,
      content: trimmed,
      variant: MessageVariant.TEXT,
    });
    setInput("");
  }, [input, id, addPendingText, enqueueSentText]);

  // Send Poke **********************************************************************************************************************
  const sendPoke = React.useCallback(() => {
    const s = socketRef.current;
    if (!s) return;
    s.emit("message", {
      conversationId: id,
      variant: MessageVariant.STATIC,
      static: StaticMessageEnum.POKE,
    });
  }, [id]);

  // Send Media Message *************************************************************************************************************
  const sendMediaMessage = React.useCallback(
    (payload: {
      uploadIds: number[];
      variant: MessageVariant.IMAGE | MessageVariant.VIDEO;
      content?: string;
    }) => {
      const s = socketRef.current;
      if (!s || payload.uploadIds.length === 0) return;
      s.emit("message", {
        conversationId: id,
        uploadIds: payload.uploadIds,
        variant: payload.variant,
        content: payload.content,
      });
    },
    [id],
  );

  // Load More Messages *************************************************************************************************************
  const loadMore = React.useCallback(() => {
    const s = socketRef.current;
    if (isMoreMessagesLoading || !hasMore || messages.length === 0 || !s)
      return;
    const nextPage = currentPage + 1;

    setCachedMessages((prev) => ({
      messages: prev?.messages ?? [],
      hasMore: prev?.hasMore ?? true,
      currentPage: nextPage,
    }));

    setIsMoreMessagesLoading(true);
    s.emit("get-conversation-messages", {
      page: nextPage.toString(),
      limit,
      conversationId: id,
    });
  }, [
    isMoreMessagesLoading,
    hasMore,
    messages.length,
    id,
    limit,
    currentPage,
    setCachedMessages,
  ]);

  const flattenedMessages = React.useMemo(
    () => groupMessagesByDay(messages),
    [messages, groupMessagesByDay],
  );

  const markConversationAsSeen = React.useCallback(() => {
    const s = socketRef.current;
    if (!s) return;
    s.emit("see-conversation", { conversationId: id });
  }, [id]);

  return {
    conversation,
    flattenedMessages,
    messages,
    loadMore,
    isConversationPending,
    isInitialPending,
    isMoreMessagesLoading,

    input,
    setInput,
    sendMessage,
    sendPoke,
    sendMediaMessage,
    pendingTextMessages,
    markConversationAsSeen,
  };
};
