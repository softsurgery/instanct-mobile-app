import { api } from "@/api";
import { SessionType } from "@/types/session";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useActiveSessionsProps {
  refetchInterval?: number;
  enabled?: boolean;
}

export const useActiveSessions = (
  { enabled, refetchInterval }: useActiveSessionsProps = {
    enabled: true,
    refetchInterval: 2000,
  },
) => {
  const {
    data: sessionsResp,
    isPending: isSessionsPending,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: () => api.session.findAllActivePaginated({}),
    refetchInterval,
    enabled,
  });

  const activeSessions = React.useMemo(
    () => sessionsResp?.data || [],
    [sessionsResp],
  );

  const mapSession = React.useMemo(
    () =>
      activeSessions.find(
        (session) => session.sessionType === SessionType.MAP_SESSION,
      ),
    [activeSessions],
  );

  return {
    activeSessions,
    mapSession,
    isSessionsPending,
    refetchSessions,
  };
};
