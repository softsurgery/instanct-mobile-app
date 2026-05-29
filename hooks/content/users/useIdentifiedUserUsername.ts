import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useIdentifiedUserUsernameProps {
  username?: string;
  join?: string;
  enabled?: boolean;
}

export const useIdentifiedUserUsername = (
  { username, join, enabled = true }: useIdentifiedUserUsernameProps = {
    join: "",
    enabled: true,
  },
) => {
  const {
    data: userResp,
    isPending: isUserPending,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user-by-username", username],
    queryFn: () => api.user.findByUsername(username!, { join }),
    enabled: enabled && !!username,
  });

  const user = React.useMemo(() => {
    return userResp || null;
  }, [userResp]);

  return { user, isUserPending, refetchUser };
};
