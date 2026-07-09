import { useNotificationContext } from "@/contexts/NotificationsContext";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { cn } from "@/lib/utils";
import { router } from "expo-router";
import { Bell, FlaskConical, Settings } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { InspectBaseProfile } from "../profile/BaseProfile";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import React from "react";
import { useChatContext } from "@/contexts/ChatContext";

interface MenuPortalProps {
  className?: string;
}

export const MenuPortal = ({ className }: MenuPortalProps) => {
  const { t } = useTranslation("common");
  const { currentUser } = useCurrentUser();
  const { count } = useNotificationContext();
  const { count: chatCount } = useChatContext();

  const handleChatPress = React.useCallback(() => {
    router.push("/main/chat");
  }, []);

  return (
    <View className={cn("flex-1", className)}>
      <InspectBaseProfile
        id={currentUser?.id as string}
        coverExtra={
          <StableSafeAreaView
            className="absolute top-0 left-0 right-0 z-30"
            pointerEvents="box-none"
          >
            <ApplicationHeader
              title={t("screens.menu")}
              classNames={{ title: "text-white" }}
              shortcuts={[
                {
                  key: "settings",
                  icon: Settings,
                  color: "white",
                  onPress: () => router.push("/main/settings"),
                },
                ...(process.env.NODE_ENV === "development"
                  ? [
                      {
                        key: "flask",
                        icon: FlaskConical,
                        color: "white",
                        onPress: () => router.push("/main/test"),
                      },
                    ]
                  : []),
                {
                  key: "notifications",
                  icon: Bell,
                  onPress: () => {
                    router.push("/main/notifications");
                  },
                  color: "white",
                  badgeText: count > 0 ? `${count}` : undefined,
                },
                {
                  key: "chat",
                  icon: IconMessageChatbot,
                  badgeText: chatCount > 0 ? String(chatCount) : undefined,
                  color: "white",
                  onPress: handleChatPress,
                },
              ]}
            />
          </StableSafeAreaView>
        }
      />
    </View>
  );
};
