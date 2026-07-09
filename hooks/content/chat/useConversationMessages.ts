import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { api } from "~/api";
import { MessageVariant, QueryParams } from "~/types";

interface useConversationMessagesProps {
  id: number;
  query?: QueryParams;
  variants?: MessageVariant[];
}

/**
 * Hook providing infinite-scrolling paginated message query capabilities for a conversation,
 * optionally filtered by message variants.
 */
export const useConversationMessages = ({
  id,
  query,
  variants = [],
}: useConversationMessagesProps) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refecthMessages,
    isRefetching,
    isPending: isMessagesPending,
  } = useInfiniteQuery({
    queryKey: ["messages", variants, id, query],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.chat.message.findPaginatedConversationMessages(id, {
        ...query,
        filter:
          variants.length > 0 ? `variant||$in||${variants.join(",")}` : "",
        page: String(pageParam),
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });

  const messages = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  return {
    messages,
    isMessagesPending,
    refecthMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
};
