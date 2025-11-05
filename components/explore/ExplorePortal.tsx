import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";

interface ExplorePortalProps {
  className?: string;
}

export const ExplorePortal = ({ className }: ExplorePortalProps) => {
  const { newCount, resetCount } = useNotificationContext();

  return (
    <StableSafeAreaView className={cn("px-2", className)}>
      <ApplicationHeader
        title="Explore"
        shortcuts={[
          {
            icon: Bell,
            onPress: () => {
              router.push("/main/notifications");
              resetCount();
            },
            badgeText: newCount > 0 ? `${newCount}` : undefined,
          },
        ]}
      />
    </StableSafeAreaView>
  );
};
