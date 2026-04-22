import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "~/api";

interface useInfiniteSessionRequestsProps {
  sessionId?: number;
  join?: string[];
  enabled?: boolean;
}

export const useInfiniteSessionRequests = (
  { sessionId, join = [], enabled = true }: useInfiniteSessionRequestsProps = {
    sessionId: undefined,
    join: [],
    enabled: true,
  },
) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchRequests,
    isRefetching,
    isPending: isRequestsPending,
  } = useInfiniteQuery({
    queryKey: ["session-requests", sessionId],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      const queryParams = {
        page: String(pageParam),
        limit: "20",
        sort: "createdAt,desc",
      };
      return api.request.findAllPaginated({
        ...queryParams,
        filter: `sessionId||$eq||${sessionId}`,
        join: join.join(","),
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled: enabled && !!sessionId,
  });

  const requests = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  return {
    requests,
    isRequestsPending,
    refetchRequests,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
};
