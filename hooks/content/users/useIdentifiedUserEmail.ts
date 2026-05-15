import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useIdentifiedUserEmailProps {
  email?: string;
  join?: string;
  enabled?: boolean;
}

export const useIdentifiedUserEmail = (
  { email, join, enabled = true }: useIdentifiedUserEmailProps = {
    join: "",
    enabled: true,
  },
) => {
  const {
    data: userResp,
    isPending: isUserPending,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user-by-email", email],
    queryFn: () => api.user.findByEmail(email!, { join }),
    enabled: enabled && !!email,
  });

  const user = React.useMemo(() => {
    return userResp || null;
  }, [userResp]);

  return { user, refetchUser, isUserPending };
};
