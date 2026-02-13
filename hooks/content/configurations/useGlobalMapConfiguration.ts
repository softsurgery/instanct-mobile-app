import { ConfigurationNamespaces } from "@/types";
import { useConfiguration } from "./useConfiguration";

interface useGlobalMapConfigurationProps {
  enabled?: boolean;
}

export const useGlobalMapConfiguration = (
  { enabled }: useGlobalMapConfigurationProps = { enabled: true },
) => {
  const { configuration, isConfigurationPending, refetchConfiguration } =
    useConfiguration({
      name: ConfigurationNamespaces.MAPS,
      enabled,
    });

  return {
    mapConfiguration: {
      rangeMax: Number(
        configuration?.params?.find((p) => p.name === "range.max")?.value,
      ),
      rangeMin: Number(
        configuration?.params?.find((p) => p.name === "range.min")?.value,
      ),
    },
    isMapConfigurationPending: isConfigurationPending,
    refetchMapConfiguration: refetchConfiguration,
  };
};
