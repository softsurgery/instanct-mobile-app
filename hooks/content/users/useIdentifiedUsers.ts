import { api } from "@/api";
import { useQueries } from "@tanstack/react-query";
import React from "react";

interface UseIdentifiedUsersProps {
  ids: (string | undefined)[];
}

export const useIdentifiedUsers = ({ ids }: UseIdentifiedUsersProps) => {
  const uniqueIds = React.useMemo(
    () => Array.from(new Set(ids.filter(Boolean))),
    [ids],
  );

  const userQueries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ["user", id],
      queryFn: () => api.user.findById(id!),
      enabled: !!id,
    })),
  });

  const usersMap = React.useMemo(() => {
    const map = new Map<string, any>();

    uniqueIds.forEach((id, index) => {
      map.set(id!, userQueries[index]?.data);
    });

    return map;
  }, [uniqueIds, userQueries]);

  const userResolvedQueries = React.useMemo(
    () =>
      ids.map((id) => ({
        id,
        user: id ? usersMap.get(id) : undefined,
        isPending: id ? userQueries[uniqueIds.indexOf(id)]?.isPending : false,
      })),
    [ids, usersMap, userQueries, uniqueIds],
  );

  const refetchAll = React.useCallback(() => {
    userQueries.forEach((query) => query.refetch());
  }, [userQueries]);

  const isPending = userQueries.some((query) => query.isPending);

  return { userResolvedQueries, isPending, refetchAll };
};
