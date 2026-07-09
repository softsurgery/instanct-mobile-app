import React from "react";
import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { ResponseUserDto } from "@/types/user-management";
import { LegendList } from "@legendapp/list";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { router } from "expo-router";
import { ArrowDownNarrowWide, Bell, CalendarCog } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Dimensions, View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { UserCard } from "./UserCard";
import { Text } from "../ui/text";
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
import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { useActiveMapSessionContext } from "@/contexts/ActiveMapSessionContext";
import { useMapStore } from "@/stores/useMapStore";

interface ExplorePortalProps {
  className?: string;
}

const height = Dimensions.get("window").height;

export const ExplorePortal = ({ className }: ExplorePortalProps) => {
  const { palette } = useColorPalette();
  const { t } = useTranslation("common");
  const { currentUser } = useCurrentUser();
  const userFilerStore = useExploreFilterStore();
  const mapStore = useMapStore();
  const { count: notificationCount } = useNotificationContext();
  const { count: chatCount } = useChatContext();
  const { activeSession, initialized } = useActiveMapSessionContext();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const { users: liveUsers } = useLiveGeolocation({
    enabled: true,
    join: ["user", "user.industries", "user.sessions"],
  });
  const { industries, isIndustriesSubTypePending } = useIndustries();
  const { objectives, isObjectivesSubTypePending } = useObjectives();

  const { latitude, longitude } = mapStore?.location?.coords || {
    latitude: 0,
    longitude: 0,
  };

  const filterCount = React.useMemo(() => {
    return (
      (userFilerStore.filters.industry?.length || 0) +
      (userFilerStore.filters.objectives?.length || 0)
    );
  }, [userFilerStore.filters]);

  const users = React.useMemo(() => {
    const targetedIndustries = userFilerStore.dto.industry;
    setCurrentIndex(0);

    const industryFiltered = liveUsers.filter(
      (user) =>
        user.id !== currentUser?.id &&
        (!targetedIndustries ||
          targetedIndustries.length === 0 ||
          user.industries?.some((industry) =>
            targetedIndustries.includes(industry.id),
          )),
    );

    const objectiveFiltered = industryFiltered.filter((user) => {
      const targetedObjectives = userFilerStore.dto.objectives;

      return (
        !targetedObjectives ||
        targetedObjectives.length === 0 ||
        user.sessions?.some((session) =>
          session.payload?.objectives?.some((objectiveId: number) =>
            targetedObjectives.includes(objectiveId),
          ),
        )
      );
    });

    return objectiveFiltered;
  }, [liveUsers, currentUser, userFilerStore.dto]);

  const handleNotificationsPress = React.useCallback(() => {
    router.push("/main/notifications");
  }, []);

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
    ({ item }: { item: ResponseUserDto }) => (
      <UserCard user={item} objectives={objectives} />
    ),
    [objectives, industries],
  );

  // useFocusEffect(
  //   React.useCallback(() => {
  //     return () => {
  //       refetchSessions();
  //     };
  //   }, [refetchSessions]),
  // );

  const color = React.useMemo(() => {
    if (!activeSession) return hslToHex(palette.foreground);
    if (activeSession && users.length === 0)
      return hslToHex(palette.foreground);
    return "white";
  }, [activeSession, users, palette]);

  return (
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
        title={
          <View key="session-countdown" className="flex flex-col items-center">
            <Text variant={"h1"} style={{ color }}>
              {t("screens.explore")}
            </Text>
            {activeSession && (
              <SessionCountdown
                session={activeSession}
                styles={{
                  text: {
                    color,
                  },
                }}
              />
            )}
          </View>
        }
        classNames={{ wrapper: cn("z-10", activeSession ? "items-start" : "") }}
        shortcuts={[
          {
            key: "end-session",
            hidden: !activeSession,
            icon: CalendarCog,
            color,
            onPress: () => router.push("/main/sessions/manage"),
          },
          {
            key: "filter",
            hidden: !activeSession,
            color,
            icon: ArrowDownNarrowWide,
            badgeText: filterCount > 0 ? String(filterCount) : undefined,
            onPress: () => router.push("/main/explore/users-filter"),
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
      {activeSession ? (
        (users.length === 0 && filterCount === 0) ||
        !initialized ||
        !latitude ||
        !longitude ||
        isObjectivesSubTypePending ||
        isIndustriesSubTypePending ? (
          <View className="flex flex-col flex-1 justify-center items-center px-4">
            <Loader />
            <Text variant={"large"} className="text-center">
              Nearby people will be available shortly, if any are around.
            </Text>
          </View>
        ) : users.length === 0 && filterCount > 0 ? (
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
                height: height,
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
