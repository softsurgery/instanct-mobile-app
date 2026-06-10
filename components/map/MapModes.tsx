import { cn } from "@/lib/utils";
import { View } from "react-native";
import { Icon } from "../ui/icon";
import * as Haptics from "expo-haptics";
import { Crosshair, RefreshCcw, SatelliteDish } from "lucide-react-native";
import { useMapStore } from "@/stores/useMapStore";
import { useLiveGeolocation } from "@/hooks/content/geolocation/useLiveGeolocation";
import { useColorPalette } from "@/hooks/useColorPalette";

interface MapModesProps {
  className?: string;
  moveToCurrentLocation?: () => void;
}

export const MapModes = ({
  className,
  moveToCurrentLocation,
}: MapModesProps) => {
  const { palette } = useColorPalette();
  const { restartSocket } = useLiveGeolocation();
  const mapStore = useMapStore();
  const modes = [
    {
      key: "refresh",
      icon: RefreshCcw,
      onPress: () => {
        restartSocket();
      },
    },
    {
      key: "globe",
      icon: SatelliteDish,
      color:
        mapStore.settings.mode !== "map" ? palette.primary : palette.foreground,
      onPress: () => {
        if (mapStore.settings.mode === "map")
          mapStore.setNested("settings.mode", "sattelite");
        else mapStore.setNested("settings.mode", "map");
      },
    },
    {
      key: "move-to-current",
      icon: Crosshair,
      onPress: () => {
        moveToCurrentLocation?.();
      },
    },
  ];

  const withHaptic = (functions: Function[]) => {
    return async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      functions.forEach((fn) => fn());
    };
  };

  return (
    <View
      className={cn(
        "flex flex-col bg-background/75 absolute top-[15%] right-3 z-50 h-auto px-3 py-4 gap-4 items-center justify-center rounded-b-full rounded-t-full",
        className,
      )}
    >
      {modes.map(({ key, icon, color, onPress }) => (
        <Icon
          key={key}
          as={icon}
          size={24}
          onPress={withHaptic([onPress])}
          {...(color ? { color } : {})}
        />
      ))}
    </View>
  );
};
