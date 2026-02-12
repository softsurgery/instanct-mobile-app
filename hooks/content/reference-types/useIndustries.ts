import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useIndustriesProps {
  enabled?: boolean;
}

export const useIndustries = (
  { enabled }: useIndustriesProps = { enabled: true },
) => {
  const {
    data: industriesResp,
    isFetching: isIndustriesPending,
    refetch: refetchIndustries,
  } = useQuery({
    queryKey: ["industries"],
    queryFn: () => api.refImpl.findAllIndustries(),
    enabled,
  });

  const industries = React.useMemo(() => {
    if (!industriesResp) return [];
    return industriesResp;
  }, [industriesResp]);

  return {
    industries,
    isIndustriesPending,
    refetch: refetchIndustries,
  };
};
