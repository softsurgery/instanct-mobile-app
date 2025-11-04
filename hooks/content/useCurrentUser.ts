import { useQuery } from "@tanstack/react-query";
import React from "react";
import { api } from "~/api";

export const useCurrentUser = () => {
  const {
    data: currentUserResp,
    isPending: isCurrentUserPending,
    refetch: refetchCurrentUser,
  } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => api.client.findCurrent(),
  });

  const currentUser = React.useMemo(() => {
    return currentUserResp || null;
  }, [currentUserResp]);

  return { currentUser, refetchCurrentUser, isCurrentUserPending };
};
