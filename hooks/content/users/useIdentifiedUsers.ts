import { api } from "@/api";
import { useQueries } from "@tanstack/react-query";
import React from "react";

interface UseIdentifiedUsersProps {
  ids: string[];
}

export const useIdentifiedUsers = ({ ids }: UseIdentifiedUsersProps) => {
  const uniqueIds = React.useMemo(
    () => Array.from(new Set(ids.filter(Boolean))),
    [ids]
  );
  const userQueries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ["user", id],
      queryFn: () => api.client.findById(id),
      enabled: !!id,
    })),
  });

  const users = React.useMemo(
    () =>
      userQueries.map(({ data, isPending, refetch }, index) => ({
        id: ids[index],
        user: data,
        isPending,
        refetch,
      })),
    [userQueries, ids]
  );

  const refetchAll = React.useCallback(() => {
    userQueries.forEach((query) => query.refetch());
  }, [userQueries]);

  return { users, refetchAll };
};
