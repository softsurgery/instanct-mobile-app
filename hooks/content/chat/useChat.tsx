import React from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
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

interface useChatProps {
  search?: string;
  limit?: number;
  join?: string;
  enabled?: boolean;
}

let listenersInitialized = false;

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
  const [count, setCount] = React.useState(0);
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

  React.useEffect(() => {
    const s = getSocket("chat", { token: authPersistStore.accessToken });

    socketRef.current = s;

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
          setCount((prev) => prev + 1);
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
    };

    const onConversationUpdatedLastCheck = (
      updated: ResponseConversationDto,
    ) => {
      queryClient.setQueryData(
        ["conversations", limit, search, join],
        (oldData: InfiniteConversationData | undefined) =>
          replaceConversationInPages(oldData, updated),
      );
    };

    if (!listenersInitialized) {
      listenersInitialized = true;
      s.on("conversation-updated-message", onConversationUpdatedMessage);
      s.on("conversation-updated-last-check", onConversationUpdatedLastCheck);
    }

    return () => {
      s.off("conversation-updated-message", onConversationUpdatedMessage);
      s.off("conversation-updated-last-check", onConversationUpdatedLastCheck);
      listenersInitialized = false;
    };
  }, [
    limit,
    search,
    join,
    queryClient,
    authPersistStore.accessToken,
    currentUser?.id,
  ]);

  const seeConversation = React.useCallback((id: number) => {
    const s = socketRef.current;
    if (!s) return;
    s.emit("see-conversation", { conversationId: id });
  }, []);

  const resetCount = React.useCallback(() => setCount(0), []);

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
