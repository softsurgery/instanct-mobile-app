import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { api } from "~/api";

interface UseInfiniteUserBookmarksProps {
  search?: string;
  join: string[];
  enabled?: boolean;
}

export const useInfiniteUserBookmarks = (
  { search = "", join = [], enabled = true }: UseInfiniteUserBookmarksProps = {
    search: "",
    join: [],
    enabled: true,
  },
) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchBookmarks,
    isRefetching,
    isPending: isBookmarksPending,
  } = useInfiniteQuery({
    queryKey: ["bookmarks", search, join],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      const queryParams = {
        page: String(pageParam),
        limit: "20",
        sort: "createdAt,desc",
        join: join.join(","),
      };

      return api.user.findPaginatedBookmarks({
        ...queryParams,
        search,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled,
  });

  const bookmarks = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  return {
    bookmarks,
    isBookmarksPending,
    refetchBookmarks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  };
};
