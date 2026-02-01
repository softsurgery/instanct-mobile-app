import { cn } from "@/lib/utils";
import { View } from "react-native";
import { Icon } from "../ui/icon";
import * as Haptics from "expo-haptics";
import { Eye, SatelliteDish } from "lucide-react-native";
import { useMapStore } from "@/stores/useMapStore";
import { THEME } from "@/lib/theme";
import { useColorScheme } from "nativewind";

interface MapModesProps {
  className?: string;
  setSessionStarted?: (value: boolean) => void;
}

export const MapModes = ({ className, setSessionStarted }: MapModesProps) => {
  const { colorScheme } = useColorScheme();
  const active =
    colorScheme === "dark" ? THEME.dark.primary : THEME.light.primary;
  const inactive =
    colorScheme === "dark" ? THEME.dark.foreground : THEME.light.foreground;
  const mapStore = useMapStore();
  const modes = [
    {
      key: "session",
      icon: Eye,
      onPress: () => setSessionStarted?.(false),
    },
    {
      key: "globe",
      icon: SatelliteDish,
      color: mapStore.paramaters.mode === "map" ? inactive : active,
      onPress: () => {
        if (mapStore.paramaters.mode === "map")
          mapStore.setNested("paramaters.mode", "sattelite");
        else mapStore.setNested("paramaters.mode", "map");
      },
    },
    // {
    //   key: "profile",
    //   icon: User,
    //   onPress: () => router.push("/main/profile/update-profile"),
    // },
    // {
    //   key: "more",
    //   icon: ChevronDownCircle,
    //   onPress: () => {},
    // },
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
