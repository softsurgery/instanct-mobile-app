import { cn } from "@/lib/utils";
import { Cog } from "lucide-react-native";
import { View } from "react-native";
import { Icon } from "../ui/icon";

interface MapModesProps {
  className?: string;
  setSessionStarted?: (value: boolean) => void;
}

export const MapModes = ({ className, setSessionStarted }: MapModesProps) => {
  const modes = [
    // {
    //   key: "session",
    //   icon: Eye,
    //   onPress: () => setSessionStarted?.(false),
    // },
    // {
    //   key: "globe",
    //   icon: Globe,
    // },
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
    {
      key: "settings",
      icon: Cog,
      onPress: () => setSessionStarted?.(false),
    },
  ];

  return (
    <View
      className={cn(
        "flex flex-col bg-background/80 absolute top-[15%] right-3 z-50 h-auto px-3 py-4 gap-4 items-center justify-center rounded-b-full rounded-t-full",
        className,
      )}
    >
      {modes.map(({ key, icon, onPress }) => (
        <Icon key={key} as={icon} size={24} onPress={onPress} />
      ))}
    </View>
  );
};
