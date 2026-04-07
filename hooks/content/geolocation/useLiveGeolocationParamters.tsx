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
    if (userMapConfiguration && mapConfiguration) {
      // Always update global parameters
      mapStore.setNested("parameters.rangeMin", mapConfiguration?.rangeMin);
      mapStore.setNested("parameters.rangeMax", mapConfiguration?.rangeMax);
      mapStore.setNested("parameters.radius", userMapConfiguration.radius);

      // Seed user settings from server on first load only
      if (!mapStore.hasInitializedParameters) {
        mapStore.setNested("settings.radius", userMapConfiguration.radius);
        mapStore.setNested("settings.clusters", userMapConfiguration.clusters);
        mapStore.setNested(
          "settings.showUsernames",
          userMapConfiguration.showUsernames,
        );
        mapStore.set("hasInitializedParameters", true);
      }
    }
  }, [userMapConfiguration, mapConfiguration]);

  return {
    refetchMapConfiguration: () => {
      refetchGlobalMapConfiguration();
      refetchUserMapConfiguration();
    },
    isPending: isMapConfigurationPending || isUserMapConfigurationPending,
  };
}
