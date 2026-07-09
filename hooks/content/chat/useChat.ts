import React from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import {
  MessageVariant,
  ResponseConversationDto,
  StaticMessageEnum,
} from "@/types";
import { Socket } from "socket.io-client";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { getSocket } from "@/lib/socket";
import {
  createAndroidChannel,
  requestNotificationPermissions,
} from "@/lib/notification";
import * as Notifications from "expo-notifications";
import { useCurrentUser } from "../users/useCurrentUser";
import { identifyUser } from "@/lib/user";
import {
  CONVERSATION_LIST_JOIN,
  InfiniteConversationData,
  moveConversationToTop,
  replaceConversationInPages,
} from "@/lib/chat";
import { useSegments, useGlobalSearchParams } from "expo-router";

export const CONVERSATIONS_UNREAD_COUNT_QUERY_KEY = [
  "conversations-unread-count",
] as const;

interface useChatProps {
  search?: string;
  limit?: number;
  join?: string;
  enabled?: boolean;
}

let chatSocketListenerCount = 0;

/**
 * Custom hook to manage paginated conversation lists, real-time socket events,
 * push notification triggers for incoming messages/pokes, and read-receipt emission.
 */
export const useChat = (
  {
    search = "",
    limit = 20,
    join = CONVERSATION_LIST_JOIN,
    enabled = true,
  }: useChatProps = {
    search: "",
    limit: 20,
    join: CONVERSATION_LIST_JOIN,
    enabled: true,
  },
) => {
  const segments = useSegments();
  const params = useGlobalSearchParams();

  const { currentUser } = useCurrentUser();
  const authPersistStore = useAuthPersistStore();
  const queryClient = useQueryClient();

  const socketRef = React.useRef<Socket | null>(null);
  const routeRef = React.useRef({ segments, params });

  React.useEffect(() => {
    routeRef.current = { segments, params };
  }, [segments, params]);

  React.useEffect(() => {
    (async () => {
      await requestNotificationPermissions();
      await createAndroidChannel();
    })();
  }, []);

  const { data: count = 0 } = useQuery({
    queryKey: CONVERSATIONS_UNREAD_COUNT_QUERY_KEY,
    queryFn: () => api.chat.conversation.getUnreadCount(),
    enabled: enabled && authPersistStore.isAuthenticated,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isPending: isConversationsPending,
  } = useInfiniteQuery({
    queryKey: ["conversations", limit, search, join],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.chat.conversation.findPaginatedUserConversations({
        page: String(pageParam),
        limit: String(limit),
        search,
        join,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled,
  });

  const conversations = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const isPending = isConversationsPending || isFetchingNextPage;

  const invalidateUnreadCount = React.useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: CONVERSATIONS_UNREAD_COUNT_QUERY_KEY,
    });
  }, [queryClient]);

  React.useEffect(() => {
    const s = getSocket("chat", { token: authPersistStore.accessToken });

    socketRef.current = s;

    /**
     * Handler triggered via Socket.io when a conversation receives a new message.
     * Triggers local push notifications if user is not viewing the active room and moves conversation to top.
     */
    const onConversationUpdatedMessage = async (
      updated: ResponseConversationDto,
    ) => {
      const user = updated.participants.find(
        (p) => p.user.id === updated.messages?.[0].userId,
      )?.user;

      const { segments: currentSegments, params: currentParams } =
        routeRef.current;
      const currentRoute = currentSegments[currentSegments.length - 1];
      const currentConversationId = currentParams.id;

      const isCurrentConversation =
        currentRoute === "conversation" &&
        currentConversationId &&
        Number(currentConversationId) === updated.id;

      if (
        user?.id !== currentUser?.id &&
        currentRoute &&
        currentRoute !== "chat" &&
        !isCurrentConversation
      ) {
        if (
          updated.messages?.[0]?.variant === MessageVariant.STATIC &&
          updated.messages?.[0]?.static === StaticMessageEnum.POKE
        ) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Poked!!!",
              body: `You've been poked by ${identifyUser(user)}`,
              sound: true,
            },
            trigger: null,
          });
        } else if (updated.messages?.[0]?.id === updated?.lastMessage?.id) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: identifyUser(user),
              body:
                updated.lastMessage.variant === MessageVariant.TEXT
                  ? updated.lastMessage.content
                  : updated.lastMessage.variant === MessageVariant.IMAGE
                    ? "📷 Image"
                    : updated.lastMessage.variant === MessageVariant.VIDEO
                      ? "🎥 Video"
                      : updated.lastMessage.variant === MessageVariant.FILE
                        ? "📎 File"
                        : updated.lastMessage.variant === MessageVariant.EMOJI
                          ? updated.lastMessage.content
                          : "",
              sound: true,
            },
            trigger: null,
          });
        }
      }

      queryClient.setQueryData(
        ["conversations", limit, search, join],
        (oldData: InfiniteConversationData | undefined) =>
          moveConversationToTop(oldData, updated),
      );
      invalidateUnreadCount();
    };

    /**
     * Handler triggered via Socket.io when participant last-check timestamps are updated.
     */
    const onConversationUpdatedLastCheck = (
      updated: ResponseConversationDto,
    ) => {
      queryClient.setQueryData(
        ["conversations", limit, search, join],
        (oldData: InfiniteConversationData | undefined) =>
          replaceConversationInPages(oldData, updated),
      );
      invalidateUnreadCount();
    };

    if (chatSocketListenerCount === 0) {
      s.on("conversation-updated-message", onConversationUpdatedMessage);
      s.on("conversation-updated-last-check", onConversationUpdatedLastCheck);
    }
    chatSocketListenerCount += 1;

    return () => {
      chatSocketListenerCount -= 1;
      if (chatSocketListenerCount === 0) {
        s.off("conversation-updated-message", onConversationUpdatedMessage);
        s.off(
          "conversation-updated-last-check",
          onConversationUpdatedLastCheck,
        );
      }
    };
  }, [
    limit,
    search,
    join,
    queryClient,
    authPersistStore.accessToken,
    currentUser?.id,
    invalidateUnreadCount,
  ]);

  /**
   * Emits a socket event to mark a specific conversation as seen by the current user.
   */
  const seeConversation = React.useCallback(
    (id: number) => {
      const s = socketRef.current;
      if (!s) return;
      s.emit("see-conversation", { conversationId: id });
      invalidateUnreadCount();
    },
    [invalidateUnreadCount],
  );

  const resetCount = React.useCallback(() => {
    invalidateUnreadCount();
  }, [invalidateUnreadCount]);

  return {
    conversations,
    hasNextPage,
    isPending,
    isRefetching,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    seeConversation,

    count,
    resetCount,
  };
};
