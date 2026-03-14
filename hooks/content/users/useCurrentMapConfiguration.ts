import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useCurrentMapConfigurationProps {
  enabled?: boolean;
}

export const useCurrentMapConfiguration = (
  { enabled = true }: useCurrentMapConfigurationProps = { enabled: true },
) => {
  const {
    data: mapConfigurationResp,
    isPending: isMapConfigurationPending,
    refetch: refetchMapConfiguration,
  } = useQuery({
    queryKey: ["current-map-configuration"],
    queryFn: () => api.user.getCurrentMapConfiguration(),
    enabled,
  });

  const mapConfiguration = React.useMemo(
    () => mapConfigurationResp || null,
    [mapConfigurationResp],
  );

  return {
    mapConfiguration: mapConfiguration
      ? {
          radius: Number(
            mapConfiguration?.params?.find((param) => param.name === "radius")
              ?.value,
          ),
          clusters:
            mapConfiguration?.params?.find((param) => param.name === "clusters")
              ?.value === "true",
          showUsernames:
            mapConfiguration?.params?.find(
              (param) => param.name === "showUsernames",
            )?.value === "true",
        }
      : null,
    isMapConfigurationPending,
    refetchMapConfiguration,
  };
};
