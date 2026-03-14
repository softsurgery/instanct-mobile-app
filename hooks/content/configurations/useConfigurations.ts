import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useConfigurationsProps {
  enabled?: boolean;
}

export const useConfigurations = (
  { enabled }: useConfigurationsProps = { enabled: true },
) => {
  const {
    data: configurationsResponse,
    isPending: isConfigurationsPending,
    refetch: refetchConfigurations,
  } = useQuery({
    queryKey: ["configurations"],
    queryFn: () => api.configuration.findAll(),
    enabled,
  });

  const configurations = React.useMemo(
    () => configurationsResponse || null,
    [configurationsResponse],
  );

  return { configurations, isConfigurationsPending, refetchConfigurations };
};
