import { api } from "@/api";
import { SessionType } from "@/types/session";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useUserSessionsProps {
  page: string;
  limit: string;
  sessionType?: SessionType;
  enabled?: boolean;
}

export const useUserSessions = (
  { page, limit, sessionType, enabled }: useUserSessionsProps = {
    page: "1",
    limit: "5",
    sessionType: SessionType.DEFAULT,
    enabled: true,
  },
) => {
  const {
    data: sessionsResp,
    isPending: isSessionsPending,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["user-sessions", sessionType, page, limit],
    queryFn: () =>
      api.session.findAllPaginated({
        page,
        limit,
        filter: `sessionType||$eq||${sessionType}`,
      }),
    enabled,
  });

  const sessions = React.useMemo(
    () => sessionsResp?.data || [],
    [sessionsResp],
  );

  return {
    sessions,
    isSessionsPending,
    refetchSessions,
  };
};
