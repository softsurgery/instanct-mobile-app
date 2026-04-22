import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { ResponseUserDto } from "@/types/user-management";
import { LegendList } from "@legendapp/list";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { router, useFocusEffect } from "expo-router";
import { ArrowDownNarrowWide, Bell, CalendarCog } from "lucide-react-native";
import React from "react";
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
import { hslToHex, THEME } from "@/lib/theme";
import { useColorScheme } from "nativewind";

interface ExplorePortalProps {
  className?: string;
}

export const ExplorePortal = ({ className }: ExplorePortalProps) => {
  const { colorScheme } = useColorScheme();
  const isDarkColorScheme = colorScheme === "dark";
  const color = hslToHex(
    isDarkColorScheme ? THEME.dark.primary : THEME.light.primary,
  );
  const usersFilterPath = "/main/explore/users-filter" as any;
  const { t } = useTranslation("common");
  const { currentUser } = useCurrentUser();
  const { newCount, resetCount } = useNotificationContext();
  const { mapSession, refetchSessions } = useActiveSessions();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const { users: liveUsers } = useLiveGeolocation({
    enabled: true,
    join: ["user", "user.industries"],
  });

  const users = React.useMemo(() => {
    return liveUsers.filter((user) => user.id !== currentUser?.id);
  }, [liveUsers, currentUser]);

  const handleNotificationsPress = React.useCallback(() => {
    resetCount();
    router.push("/main/notifications");
  }, [resetCount]);

  const handleChatPress = React.useCallback(() => {
    router.push("/main/chat");
  }, []);

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

  return (
    <StableSafeAreaView
      className={cn("flex flex-1 flex-col bg-background", className)}
    >
      <ApplicationHeader
        title={
          <View key="session-countdown" className="flex flex-col items-center">
            <Text variant={"h1"}>{t("screens.explore")}</Text>
            {mapSession && <SessionCountdown session={mapSession} />}
          </View>
        }
        className={cn(mapSession ? "items-start" : "")}
        shortcuts={[
          {
            key: "end-session",
            hidden: !mapSession,
            icon: CalendarCog,
            color: hslToHex(color),
            onPress: () => router.push("/main/sessions/manage"),
          },
          {
            key: "filter",
            hidden: !mapSession,
            icon: ArrowDownNarrowWide,
            onPress: () => router.push(usersFilterPath),
          },
          {
            key: "notifications",
            icon: Bell,
            onPress: handleNotificationsPress,
            badgeText: newCount > 0 ? String(newCount) : undefined,
          },
          {
            key: "chat",
            icon: IconMessageChatbot,
            onPress: handleChatPress,
          },
        ].filter(Boolean)}
      />
      {mapSession ? (
        users.length === 0 ? (
          <View className="flex flex-col flex-1 justify-center items-center px-4">
            <Loader />
            <Text variant={"large"} className="text-center">
              Nearby people will be available shortly, if any are around.
            </Text>
          </View>
        ) : (
          <View className="flex-1 bg-transparent mt-2">
            <LegendList
              className="flex-1"
              data={users}
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
              contentContainerStyle={{
                paddingHorizontal: 0,
              }}
            />
            <View className="mx-4 mb-4 items-center">
              <View className="flex flex-row justify-between items-center">
                <Text className="text-lg font-bold">
                  {currentIndex + 1} / {users.length}
                </Text>
              </View>
            </View>
          </View>
        )
      ) : (
        <SessionStarter className="px-4" />
      )}
    </StableSafeAreaView>
  );
};
