import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { router } from "expo-router";
import { Bell, Settings } from "lucide-react-native";
import { View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { ProfileEntry } from "./ProfileEntry";

interface MenuPortalProps {
  className?: string;
}

export const MenuPortal = ({ className }: MenuPortalProps) => {
  const { newCount, resetCount } = useNotificationContext();
  return (
    <StableSafeAreaView className={cn("px-4", className)}>
      <ApplicationHeader
        title="Menu"
        shortcuts={[
          {
            icon: Bell,
            onPress: () => {
              router.push("/main/notifications");
              resetCount();
            },
            badgeText: newCount > 0 ? `${newCount}` : undefined,
          },
          {
            key: "settings",
            icon: Settings,
            onPress: () => {
              router.push("/main/settings");
            },
          },
        ]}
      />
      <View>
        <ProfileEntry />
      </View>
    </StableSafeAreaView>
  );
};
