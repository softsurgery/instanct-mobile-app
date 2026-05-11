import React from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { ResponseConversationDto } from "@/types";
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
    queryKey: ["conversations", limit, search],
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

    s.on("connect", () => {
      console.log("Connected to chat server");
    });

    s.on("conversation-updated", (updated: ResponseConversationDto) => {
      console.log("Conversation updated:", updated);
      queryClient.setQueryData(
        ["conversations", limit, search],
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((conv: ResponseConversationDto) =>
                conv.id === updated.id ? updated : conv,
              ),
            })),
          };
        },
      );
    });

    return () => {
      s.disconnect();
    };
  }, [limit, search, authPersistStore.accessToken]);

  return {
    conversations,
    hasNextPage,
    isPending,
    isRefetching,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  };
};
