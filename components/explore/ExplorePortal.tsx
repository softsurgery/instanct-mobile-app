import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import React from "react";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { ObjectivesBadgeList } from "./ObjectivesBadgeList";

interface ExplorePortalProps {
  className?: string;
}

export const ExplorePortal = ({ className }: ExplorePortalProps) => {
  const { newCount, resetCount } = useNotificationContext();

  return (
    <StableSafeAreaView className={cn("flex-1 px-2 bg-background", className)}>
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
          {
            icon: IconMessageChatbot,
            onPress: () => {
              router.push("/main/chat");
            },
          },
        ]}
      />
      <ObjectivesBadgeList className="mt-5" />
    </StableSafeAreaView>
  );
};
