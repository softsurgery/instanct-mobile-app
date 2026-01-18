import { useNotificationContext } from "@/contexts/NotificationsContext";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { cn } from "@/lib/utils";
import { router } from "expo-router";
import { Bell, FlaskConical, Settings } from "lucide-react-native";
import { View } from "react-native";
import { InspectBaseProfile } from "../profile/BaseProfile";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";

interface MenuPortalProps {
  className?: string;
}

export const MenuPortal = ({ className }: MenuPortalProps) => {
  const { currentUser } = useCurrentUser();
  const { newCount, resetCount } = useNotificationContext();
  return (
    <View className={cn("flex-1", className)}>
      <InspectBaseProfile
        id={currentUser?.id as string}
        coverExtra={
          <StableSafeAreaView
            className="absolute top-0 left-0 right-0 z-30 px-2"
            pointerEvents="box-none"
          >
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
                  onPress: () => router.push("/main/settings"),
                },
                ...(process.env.NODE_ENV === "development"
                  ? [
                      {
                        key: "flask",
                        icon: FlaskConical,
                        onPress: () => router.push("/main/test"),
                      },
                    ]
                  : []),
              ]}
            />
          </StableSafeAreaView>
        }
      />
    </View>
  );
};
