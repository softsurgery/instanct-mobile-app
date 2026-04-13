import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "~/api";

interface useInfiniteIncomingSessionRequestsProps {
  sessionId?: number;
  enabled?: boolean;
}

export const useInfiniteIncomingSessionRequests = (
  { sessionId, enabled = true }: useInfiniteIncomingSessionRequestsProps = {
    sessionId: undefined,
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
    isPending: isIncomingRequestsPending,
  } = useInfiniteQuery({
    queryKey: ["incoming-session-requests", sessionId],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      const queryParams = {
        page: String(pageParam),
        limit: "20",
        sort: "createdAt,desc",
      };
      return api.request.findAllIncomingPaginated(sessionId!, {
        ...queryParams,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled: enabled && !!sessionId,
  });

  const incomingRequests = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
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
