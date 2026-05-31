import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "~/api";

interface useInfiniteOutgoingSessionRequestsProps {
  limit?: number;
  join?: string[];
  enabled?: boolean;
}

export const useInfiniteOutgoingSessionRequests = (
  { limit = 5, join = [], enabled = true }: useInfiniteOutgoingSessionRequestsProps = {
    limit: 5,
    join: [],
    enabled: true,
  },
) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchOutgoingRequests,
    isRefetching,
    isLoading: isOutgoingRequestsPending,
  } = useInfiniteQuery({
    queryKey: ["outgoing-requests"],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      const queryParams = {
        page: String(pageParam),
        limit: String(limit),
        sort: "createdAt,desc",
        join: join.join(","),
      };
      return api.request.findAllOutgoingPaginated(queryParams);
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled,
  });

  const outgoingRequests = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data || []) ?? [];
  }, [data]);

  return {
    outgoingRequests,
    isOutgoingRequestsPending,
    refetchOutgoingRequests,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
};
