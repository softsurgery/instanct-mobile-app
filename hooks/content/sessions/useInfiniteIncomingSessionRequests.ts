import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "~/api";

interface useInfiniteIncomingSessionRequestsProps {
  limit?: number;
  join?: string[];
  enabled?: boolean;
}

export const useInfiniteIncomingSessionRequests = (
  { limit = 5, join = [], enabled = true }: useInfiniteIncomingSessionRequestsProps = {
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
    refetch: refetchIncomingRequests,
    isRefetching,
    isLoading: isIncomingRequestsPending,
  } = useInfiniteQuery({
    queryKey: ["incoming-requests"],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      const queryParams = {
        page: String(pageParam),
        limit: String(limit),
        sort: "createdAt,desc",
        join: join.join(","),
      };
      return api.request.findAllIncomingPaginated(queryParams);
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled,
  });

  const incomingRequests = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data || []) ?? [];
  }, [data]);

  return {
    incomingRequests,
    isIncomingRequestsPending,
    refetchIncomingRequests,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
};
