import { useQuery } from "@tanstack/react-query";
import React from "react";
import { message as messageApi } from "~/api/chat/message";
import { useDebounce } from "@/hooks/useDebounce";
import { filterMessagesByContentQuery } from "@/lib/messageSearch";
import { MESSAGE_SEARCH_JOIN } from "@/lib/chat";

interface UseConversationMessageSearchProps {
  conversationId: number;
  enabled?: boolean;
}

export const useConversationMessageSearch = ({
  conversationId,
  enabled = true,
}: UseConversationMessageSearchProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { value: debouncedQuery, loading: isDebouncing } = useDebounce(
    searchQuery,
    300,
  );

  const trimmedQuery = debouncedQuery.trim();
  const isQueryActive = trimmedQuery.length > 0;

  const { data, isFetching, isPending } = useQuery({
    queryKey: ["conversation-message-search", conversationId, trimmedQuery],
    queryFn: () =>
      messageApi.findPaginatedConversationMessages(conversationId, {
        page: "1",
        limit: "50",
        sort: "createdAt,DESC",
        filter: `content||$cont||${trimmedQuery}`,
        join: MESSAGE_SEARCH_JOIN,
      }),
    enabled:
      enabled &&
      Number.isFinite(conversationId) &&
      conversationId > 0 &&
      isQueryActive,
    staleTime: 30_000,
  });

  const results = React.useMemo(
    () => filterMessagesByContentQuery(data?.data ?? [], trimmedQuery),
    [data?.data, trimmedQuery],
  );
  const isSearching =
    isDebouncing || (isQueryActive && (isFetching || isPending));

  const clearSearch = React.useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    results,
    isSearching,
    isQueryActive,
    resultCount: results.length,
  };
};
