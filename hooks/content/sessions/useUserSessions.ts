import { api } from "@/api";
import { SessionType } from "@/types/session";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useUserSessionsProps {
  page: string;
  limit: string;
  sessionType?: SessionType;
  sort?: string;
  enabled?: boolean;
}

export const useUserSessions = (
  { page, limit, sessionType, sort, enabled }: useUserSessionsProps = {
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
    queryKey: ["user-sessions", sessionType, page, limit, sort],
    queryFn: () =>
      api.session.findAllPaginated({
        page,
        limit,
        sort,
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
