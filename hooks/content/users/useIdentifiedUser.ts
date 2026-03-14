import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useIdentifiedUserProps {
  id: string;
}

export const useIdentifiedUser = ({ id }: useIdentifiedUserProps) => {
  const {
    data: userResp,
    isPending: isUserPending,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => api.user.findById(id),
  });

  const user = React.useMemo(() => {
    return userResp || null;
  }, [userResp]);

  return { user, refetchUser, isUserPending };
};
