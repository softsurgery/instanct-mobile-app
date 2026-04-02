import { useMapStore } from "@/stores/useMapStore";
import { useGlobalMapConfiguration } from "../configurations/useGlobalMapConfiguration";
import { useCurrentMapConfiguration } from "../users/useCurrentMapConfiguration";
import React from "react";

interface useLiveGeolocationParameters {}

export function useLiveGeolocationParameters({}: useLiveGeolocationParameters = {}) {
  const mapStore = useMapStore();
  //global configuration
  const {
    mapConfiguration,
    isMapConfigurationPending,
    refetchMapConfiguration: refetchGlobalMapConfiguration,
  } = useGlobalMapConfiguration();

  //user map configuration
  const {
    mapConfiguration: userMapConfiguration,
    isMapConfigurationPending: isUserMapConfigurationPending,
    refetchMapConfiguration: refetchUserMapConfiguration,
  } = useCurrentMapConfiguration();

  React.useEffect(() => {
    if (
      userMapConfiguration &&
      mapConfiguration &&
      !mapStore.hasInitializedParameters
    ) {
      mapStore.setNested("parameters.radius", userMapConfiguration.radius);
      mapStore.setNested("parameters.rangeMin", mapConfiguration?.rangeMin);
      mapStore.setNested("parameters.rangeMax", mapConfiguration?.rangeMax);
      mapStore.setNested("parameters.clusters", userMapConfiguration.clusters);
      mapStore.setNested(
        "parameters.showUsernames",
        userMapConfiguration.showUsernames,
      );
      mapStore.set("hasInitializedParameters", true);
    }
    return () => {
      mapStore.set("hasInitializedParameters", false);
    };
  }, [userMapConfiguration, mapConfiguration]);

  return {
    refetchMapConfiguration: () => {
      refetchGlobalMapConfiguration();
      refetchUserMapConfiguration();
    },
    isPending: isMapConfigurationPending || isUserMapConfigurationPending,
  };
}
