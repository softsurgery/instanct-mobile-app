import { api } from "@/api";
import { ResponseRefParamDto } from "@/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useObjectivesProps {
  enabled?: boolean;
}

export const useObjectives = (
  { enabled }: useObjectivesProps = { enabled: true },
) => {
  const {
    data: objectivesResp,
    isFetching: isObjectivesPending,
    refetch: refetchObjectives,
  } = useQuery({
    queryKey: ["objectives"],
    queryFn: () => api.refImpl.findAllObjectives(),
    enabled,
  });

  const objectives = React.useMemo(() => {
    if (!objectivesResp) return [];
    return objectivesResp as ResponseRefParamDto<{ color: string }>[];
  }, [objectivesResp]);

  return {
    objectives,
    isObjectivesPending,
    refetchObjectives,
  };
};
