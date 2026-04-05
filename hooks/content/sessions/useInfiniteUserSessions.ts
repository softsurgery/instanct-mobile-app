import { SessionType } from "@/types/session";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { api } from "~/api";

interface useInfiniteUserSessionsProps {
  search?: string;
  sessionType?: SessionType;
  enabled?: boolean;
}

export const useInfiniteUserSessions = (
  {
    search = "",
    sessionType = SessionType.DEFAULT,
    enabled = true,
  }: useInfiniteUserSessionsProps = {
    search: "",
    sessionType: SessionType.DEFAULT,
    enabled: true,
  },
) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchSessions,
    isRefetching,
    isPending: isSessionsPending,
  } = useInfiniteQuery({
    queryKey: ["sessions", search, sessionType],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      const queryParams = {
        page: String(pageParam),
        limit: "20",
        sort: "createdAt,desc",
      };
      return api.session.findAllPaginated({
        ...queryParams,
        ...(sessionType ? { filter: `sessionType||$eq||${sessionType}` } : {}),
        search,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled,
  });

  const sessions = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  return {
    sessions,
    isSessionsPending,
    refetchSessions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
};
