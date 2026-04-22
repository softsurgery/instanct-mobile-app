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
    data: industriesSubTypeResp,
    isPending: isIndustriesSubTypePending,
    refetch: refetchIndustries,
  } = useQuery({
    queryKey: ["industries"],
    queryFn: async () =>
      api.referenceTypes.refType.findAll({
        filter: "parentId||$eq||industry",
        join: "params",
      }),
    enabled,
  });

  const industries = React.useMemo(() => {
    if (!industriesSubTypeResp) return [];
    return industriesSubTypeResp.flatMap((refType) => refType.params);
  }, [industriesSubTypeResp]);

  return {
    industriesSubTypeResp,
    industries,
    isIndustriesSubTypePending,
    refetchIndustries,
  };
};
