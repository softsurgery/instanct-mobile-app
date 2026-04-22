import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useObjectivesProps {
  enabled?: boolean;
}

export const useObjectives = (
  { enabled }: useObjectivesProps = { enabled: true },
) => {
  const {
    data: objectivesSubTypeResp,
    isPending: isObjectivesSubTypePending,
    refetch: refetchObjectives,
  } = useQuery({
    queryKey: ["objectives"],
    queryFn: async () =>
      api.referenceTypes.refType.findAll({
        filter: "parentId||$eq||objectif",
        join: "params",
      }),
    enabled,
  });

  const objectives = React.useMemo(() => {
    if (!objectivesSubTypeResp) return [];
    return objectivesSubTypeResp.flatMap((refType) => refType.params);
  }, [objectivesSubTypeResp]);


  return {
    objectivesSubTypeResp,
    objectives,
    isObjectivesSubTypePending,
    refetchObjectives,
  };
};
