import React from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";

interface useMyConversationsProps {
  search?: string;
  limit?: number;
  join?: string;
  enabled?: boolean;
}

const CHAT_SERVER_URL = process.env.EXPO_PUBLIC_API_SOCKET_URL;

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

  /**
   * Create socket instance
   */
  const socket = React.useMemo<Socket>(() => {
    return io(CHAT_SERVER_URL, {
      extraHeaders: {
        Authorization: `Bearer ${authPersistStore.accessToken}`,
      },
    });
  }, [authPersistStore.accessToken]);

  /**
   * Cleanup socket on unmount
   */
  React.useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  /**
   * Fetch conversations through socket
   */
  const fetchConversations = React.useCallback(
    (pageParam: number) => {
      return new Promise<any>((resolve, reject) => {
        if (!socket.connected) {
          socket.connect();
        }

        const timeout = setTimeout(() => {
          socket.off("my-conversations", handleResponse);
          reject(new Error("Socket request timeout"));
        }, 10000);

        const handleResponse = (response: any) => {
          clearTimeout(timeout);
          socket.off("my-conversations", handleResponse);

          resolve(response);
        };

        socket.on("my-conversations", handleResponse);

        socket.emit("get-my-conversations", {
          query: {
            page: String(pageParam),
            limit: String(limit),
            sort: "lastMessage.createdAt,DESC",
            search,
            join,
          },
        });
      });
    },
    [socket, limit, search, join],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isPending: isConversationsPending,
  } = useInfiniteQuery({
    queryKey: ["socket-conversations", limit, search, join],
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchConversations(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });

  /**
   * Flatten pages
   */
  const conversations = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  /**
   * Pending state
   */
  const isPending = isConversationsPending || isFetchingNextPage;

  /**
   * Optional realtime updates
   */
  React.useEffect(() => {
    const handleConversationUpdated = (updatedConversation: any) => {
      queryClient.setQueryData(
        ["socket-conversations", limit, search, join],
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((conversation: any) =>
                conversation.id === updatedConversation.id
                  ? updatedConversation
                  : conversation,
              ),
            })),
          };
        },
      );
    };

    socket.on("conversation-updated", handleConversationUpdated);

    return () => {
      socket.off("conversation-updated", handleConversationUpdated);
    };
  }, [socket, queryClient, limit, search, join]);

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
