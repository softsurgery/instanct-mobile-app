import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useIdentifiedUserProps {
  id?: string;
  join?: string;
  enabled?: boolean;
}

export const useIdentifiedUser = (
  { id, join, enabled = true }: useIdentifiedUserProps = {
    join: "",
    enabled: true,
  },
) => {
  const {
    data: userResp,
    isPending: isUserPending,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => api.user.findById(id!, { join }),
    enabled: enabled && !!id,
  });

  const user = React.useMemo(() => {
    return userResp || null;
  }, [userResp]);

  return { user, refetchUser, isUserPending };
};
