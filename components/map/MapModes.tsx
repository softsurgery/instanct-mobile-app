import { View } from "react-native";
import { Icon } from "../ui/icon";
import { router } from "expo-router";
import { ChevronDownCircle, Eye, Globe, User } from "lucide-react-native";
import { cn } from "@/lib/utils";

interface MapModesProps {
  className?: string;
  setSessionStarted?: (value: boolean) => void;
}

export const MapModes = ({ className, setSessionStarted }: MapModesProps) => {
  const modes = [
    {
      key: "session",
      icon: Eye,
      onPress: () => setSessionStarted?.(false),
    },
    {
      key: "globe",
      icon: Globe,
    },
    {
      key: "profile",
      icon: User,
      onPress: () => router.push("/main/update-profile"),
    },
    {
      key: "more",
      icon: ChevronDownCircle,
      onPress: () => {},
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
        <Icon key={key} as={icon} size={20} onPress={onPress} />
      ))}
    </View>
  );
};
