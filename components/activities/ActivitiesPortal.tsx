import React from "react";
import StableScrollView from "@/components/shared/StableScrollView";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { cn } from "@/lib/utils";
import { MapSessionPayload, ResponseSessionDto } from "@/types/session";
import { router, useLocalSearchParams } from "expo-router";
import { Bell, Clock } from "lucide-react-native";
import Animated from "react-native-reanimated";
import { ActivitiesDetailContent } from "./ActivitiesDetailContent";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/contexts/NotificationsContext";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { useScrollableElement } from "@/hooks/useScrollableElement";
import { useChatContext } from "@/contexts/ChatContext";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";

interface ActivitiesPortalProps {
  className?: string;
}

export const ActivitiesPortal = ({ className }: ActivitiesPortalProps) => {
  const { t } = useTranslation("common");
  const { currentUser } = useCurrentUser();
  const { count, resetCount } = useNotificationContext();
  const { count: chatCount, resetCount: resetChatCount } = useChatContext();

  const { session: sessionParam } = useLocalSearchParams<{
    session?: string;
  }>();

  const handleNotificationsPress = React.useCallback(() => {
    resetCount();
    router.push("/main/notifications");
  }, [resetCount]);

  const handleChatPress = React.useCallback(() => {
    resetChatCount();
    router.push("/main/chat");
  }, [resetChatCount]);

  const { animatedHeaderStyle, handleScroll } = useScrollableElement({
    deltaThreshold: 40,
    duration: 250,
  });

  const session =
    React.useMemo<ResponseSessionDto<MapSessionPayload> | null>(() => {
      if (!sessionParam || typeof sessionParam !== "string") return null;
      try {
        return JSON.parse(
          sessionParam,
        ) as ResponseSessionDto<MapSessionPayload>;
      } catch {
        return null;
      }
    }, [sessionParam]);

  return (
    <StableSafeAreaView className={cn("flex-1", className)}>
      <Animated.View style={animatedHeaderStyle}>
        <ApplicationHeader
          title={t("screens.activities", "Activities")}
          shortcuts={[
            // {
            //   key: "sessions",
            //   icon: Clock,
            //   color: "white",
            //   onPress: () =>
            //     router.push({
            //       pathname: "/main/sessions",
            //       params: {
            //         session: currentUser?.id,
            //       },
            //     }),
            // },
            {
              key: "bell",
              icon: Bell,
              onPress: handleNotificationsPress,
              badgeText: count > 0 ? String(count) : undefined,
            },
            {
              key: "chat",
              icon: IconMessageChatbot,
              onPress: handleChatPress,
              badgeText: chatCount > 0 ? String(chatCount) : undefined,
            },
          ]}
        />
      </Animated.View>
      <StableScrollView className="flex-1 bg-background">
        <ActivitiesDetailContent
          session={session}
          handleScroll={handleScroll}
        />
      </StableScrollView>
    </StableSafeAreaView>
  );
};
