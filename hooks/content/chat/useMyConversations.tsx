import React from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { PageMeta, ResponseConversationDto } from "@/types";
import { io, Socket } from "socket.io-client";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";

const CHAT_SERVER_URL = process.env.EXPO_PUBLIC_API_SOCKET_URL;

interface useMyConversationsProps {
  search: string;
  limit?: number;
  join?: string;
  enabled: boolean;
}

export const useMyConversations = (
  {
    search = "",
    limit = 20,
    join = "",
    enabled = true,
  }: useMyConversationsProps = {
    search: "",
    limit: 20,
    join: "",
    enabled: true,
  },
) => {
  const queryClient = useQueryClient();
  const authPersistStore = useAuthPersistStore();

  const socketRef = React.useRef<Socket | null>(null);

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
        sort: "lastMessage.createdAt,desc",
        search: search,
        join,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });

  const conversations = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const isPending = isConversationsPending || isFetchingNextPage;

  React.useEffect(() => {
    const s = io(CHAT_SERVER_URL, {
      extraHeaders: {
        Authorization: `Bearer ${authPersistStore.accessToken}`,
      },
    });

    socketRef.current = s;

    s.on("connect", () => {});

    s.on("conversation-updated-message", (updated) => {
      queryClient.setQueryData(
        ["conversations", limit, search, join],
        (oldData: InfiniteConversationData | undefined) =>
          moveConversationToTop(oldData, updated),
      );
    });

    s.on("conversation-updated-last-check", (updated) => {
      queryClient.setQueryData(
        ["conversations", limit, search, join],
        (oldData: InfiniteConversationData | undefined) =>
          replaceConversationInPages(oldData, updated),
      );
    });

    return () => {
      s.disconnect();
    };
  }, [limit, search, join, authPersistStore.accessToken, queryClient]);

  const seeConversation = React.useCallback((id: number) => {
    const s = socketRef.current;
    if (!s) return;
    s.emit("see-conversation", { conversationId: id });
  }, []);

  return {
    conversations,
    hasNextPage,
    isPending,
    isRefetching,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    seeConversation,
  };
};

type InfiniteConversationData = {
  pages: {
    data: ResponseConversationDto[];
  }[];
  pageParams: PageMeta[];
};

const replaceConversationInPages = (
  oldData: InfiniteConversationData | undefined,
  updated: ResponseConversationDto,
): InfiniteConversationData | undefined => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((conv) => (conv.id === updated.id ? updated : conv)),
    })),
  };
};

const moveConversationToTop = (
  oldData: InfiniteConversationData | undefined,
  updated: ResponseConversationDto,
): InfiniteConversationData | undefined => {
  if (!oldData) return oldData;

  const allConversations = oldData.pages.flatMap((p) => p.data);

  const filtered = allConversations.filter((conv) => conv.id !== updated.id);

  const reordered = [updated, ...filtered];

  let cursor = 0;

  const rebuiltPages = oldData.pages.map((page) => {
    const pageSize = page.data.length;

    const data = reordered.slice(cursor, cursor + pageSize);

    cursor += pageSize;

    return {
      ...page,
      data,
    };
  });

  return {
    ...oldData,
    pages: rebuiltPages,
  };
};
