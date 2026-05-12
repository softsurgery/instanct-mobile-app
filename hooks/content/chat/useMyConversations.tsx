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

    s.on("connect", () => {});

    s.on("conversation-updated-message", (updated: ResponseConversationDto) => {
      queryClient.setQueryData(
        ["conversations", limit, search],
        (oldData: any) => {
          if (!oldData) return oldData;

          let updatedConversation: ResponseConversationDto | null = null;

          const newPages = oldData.pages.map((page: any) => {
            const filteredData = page.data.filter(
              (conv: ResponseConversationDto) => {
                if (conv.id === updated.id) {
                  updatedConversation = updated;
                  return false;
                }
                return true;
              },
            );

            return {
              ...page,
              data: filteredData,
            };
          });

          if (updatedConversation) {
            newPages[0] = {
              ...newPages[0],
              data: [updatedConversation, ...newPages[0].data],
            };
          }

          return {
            ...oldData,
            pages: newPages,
          };
        },
      );
    });

    s.on(
      "conversation-updated-last-check",
      (updated: ResponseConversationDto) => {
        queryClient.setQueryData(
          ["conversations", limit, search],
          (oldData: any) => {
            if (!oldData) return oldData;

            const newPages = oldData.pages.map((page: any) => {
              const newData = page.data.map((conv: ResponseConversationDto) => {
                if (conv.id === updated.id) {
                  return updated;
                }
                return conv;
              });

              return {
                ...page,
                data: newData,
              };
            });

            return {
              ...oldData,
              pages: newPages,
            };
          },
        );
      },
    );

    return () => {
      s.disconnect();
    };
  }, [limit, search, authPersistStore.accessToken]);

  const seeConversation = React.useCallback((id: number) => {
    const s = socketRef.current;
    if (!s) return;
    console.log("Emitting see-conversation for conversationId:", id);
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
