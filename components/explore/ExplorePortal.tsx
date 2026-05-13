import React from "react";
import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { ResponseUserDto } from "@/types/user-management";
import { LegendList } from "@legendapp/list";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { router, useFocusEffect } from "expo-router";
import { ArrowDownNarrowWide, Bell, CalendarCog } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { UserCard } from "./UserCard";
import { Text } from "../ui/text";
import { useActiveSessions } from "@/hooks/content/sessions/useActiveSessions";
import { SessionCountdown } from "../session/SessionCountdown";
import { SessionStarter } from "../session/SessionStarter";
import { useLiveGeolocation } from "@/hooks/content/geolocation/useLiveGeolocation";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { Loader } from "../shared/Loader";
import { useExploreFilterStore } from "@/stores/userExploreFilterStore";
import { NotFound } from "../shared/NotFound";
import { hslToHex } from "@/lib/theme";
import { useColorPalette } from "@/hooks/useColorPalette";
import { useChatContext } from "@/contexts/ChatContext";

interface ExplorePortalProps {
  className?: string;
}

export const ExplorePortal = ({ className }: ExplorePortalProps) => {
  const { palette } = useColorPalette();
  const usersFilterPath = "/main/explore/users-filter" as any;
  const { t } = useTranslation("common");
  const { currentUser } = useCurrentUser();
  const userFilerStore = useExploreFilterStore();
  const { count: notificationCount, resetCount: resetNotificationCount } =
    useNotificationContext();
  const { count: chatCount, resetCount: resetChatCount } = useChatContext();
  const { mapSession, refetchSessions } = useActiveSessions();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const { users: liveUsers } = useLiveGeolocation({
    enabled: true,
    join: ["user", "user.industries", "user.sessions"],
  });

  const users = React.useMemo(() => {
    const targetedIndustries = userFilerStore.dto.industry;
    setCurrentIndex(0);

    return liveUsers.filter(
      (user) =>
        user.id !== currentUser?.id &&
        (!targetedIndustries ||
          targetedIndustries.length === 0 ||
          user.industries?.some((industry) =>
            targetedIndustries.includes(industry.id),
          )),
    );
  }, [liveUsers, currentUser, userFilerStore.dto]);

  const handleNotificationsPress = React.useCallback(() => {
    resetNotificationCount();
    router.push("/main/notifications");
  }, [resetNotificationCount]);

  const handleChatPress = React.useCallback(() => {
    resetChatCount();
    router.push("/main/chat");
  }, [resetChatCount]);

  const handleScroll = React.useCallback((event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const screenWidth = event.nativeEvent.layoutMeasurement.width;
    const newIndex = Math.round(contentOffsetX / screenWidth);
    setCurrentIndex(newIndex);
  }, []);

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseUserDto }) => <UserCard user={item} />,
    [],
  );

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        refetchSessions();
      };
    }, [refetchSessions]),
  );

  const color = React.useMemo(() => {
    if (!mapSession) return hslToHex(palette.foreground);
    if (mapSession && users.length === 0) return hslToHex(palette.foreground);
    return "white";
  }, [mapSession, users, palette]);

  return (
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
        title={
          <View key="session-countdown" className="flex flex-col items-center">
            <Text variant={"h1"} style={{ color }}>
              {t("screens.explore")}
            </Text>
            {mapSession && users.length !== 0 && (
              <SessionCountdown
                classNames={{ text: `text-${color}` }}
                session={mapSession}
              />
            )}
          </View>
        }
        classNames={{ wrapper: cn("z-10", mapSession ? "items-start" : "") }}
        shortcuts={[
          {
            key: "end-session",
            hidden: !mapSession,
            icon: CalendarCog,
            color,
            onPress: () => router.push("/main/sessions/manage"),
          },
          {
            key: "filter",
            hidden: !mapSession,
            color,
            icon: ArrowDownNarrowWide,
            onPress: () => router.push(usersFilterPath),
          },
          {
            key: "notifications",
            color,
            icon: Bell,
            badgeText:
              notificationCount > 0 ? String(notificationCount) : undefined,
            onPress: handleNotificationsPress,
          },
          {
            key: "chat",
            color,
            icon: IconMessageChatbot,
            badgeText: chatCount > 0 ? String(chatCount) : undefined,
            onPress: handleChatPress,
          },
        ].filter(Boolean)}
      />
      {mapSession ? (
        liveUsers.length === 0 ? (
          <View className="flex flex-col flex-1 justify-center items-center px-4">
            <Loader />
            <Text variant={"large"} className="text-center">
              Nearby people will be available shortly, if any are around.
            </Text>
          </View>
        ) : users.length === 0 ? (
          <View className="flex flex-col flex-1 justify-center items-center px-4">
            <NotFound />
            <Text variant={"large"} className="text-center">
              No one matches your filters right now. Try adjusting or removing
              some filters to see more people around you.
            </Text>
          </View>
        ) : (
          <>
            <LegendList
              data={users}
              style={{
                flex: 1,
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              recycleItems={true}
              bounces={false}
              alwaysBounceVertical={false}
              alwaysBounceHorizontal={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              onScroll={handleScroll}
            />
            <View className="absolute bottom-4 right-1/2 translate-x-1/2 px-4 py-2 bg-background bg-opacity-70 rounded-full border border-border">
              <View className="flex flex-row justify-between items-center">
                <Text className="text-lg font-bold">
                  {currentIndex + 1} / {users.length}
                </Text>
              </View>
            </View>
          </>
        )
      ) : (
        <SessionStarter className="px-4" />
      )}
    </StableSafeAreaView>
  );
};
