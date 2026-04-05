import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { ResponseUserDto } from "@/types/user-management";
import { LegendList } from "@legendapp/list";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { router, useFocusEffect } from "expo-router";
import { ArrowDownNarrowWide, Bell, Play } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { UserCard } from "./UserCard";
import { Text } from "../ui/text";
import { UsersFilter } from "./users-filter/UsersFilter";
import { useActiveSessions } from "@/hooks/content/sessions/useActiveSessions";
import { SessionCountdown } from "../session/SessionCountdown";
import { SessionStarter } from "../session/SessionStarter";
import { useLiveGeolocation } from "@/hooks/content/geolocation/useLiveGeolocation";
import { EndSessionDialog } from "../session/SessionEndDialog";
import { api } from "@/api";
import { useMutation } from "@tanstack/react-query";
import { showToastable } from "react-native-toastable";
import { ServerErrorResponse } from "@/types";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { Icon } from "../ui/icon";
import { StablePressable } from "../shared/StablePressable";
import { hslToHex, THEME } from "@/lib/theme";
import { useColorScheme } from "nativewind";

interface ExplorePortalProps {
  className?: string;
}

export const ExplorePortal = ({ className }: ExplorePortalProps) => {
  const { colorScheme } = useColorScheme();
  const isDarkColorScheme = colorScheme === "dark";
  const { t } = useTranslation("common");
  const { currentUser } = useCurrentUser();
  const { newCount, resetCount } = useNotificationContext();
  const { mapSession, refetchSessions } = useActiveSessions();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [openUserFilters, setOpenUserFilters] = React.useState(false);
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

  const { mutate: endSession, isPending: isEndingSessionPending } = useMutation(
    {
      mutationFn: async () => api.session.end(mapSession?.id!),
      onSuccess: (data) => {
        showToastable({
          message: "Session ended successfully!",
        });
        refetchSessions();
      },
      onError: (error: ServerErrorResponse) => {
        Alert.alert("Error", JSON.stringify(error.message, null, 2));
      },
    },
  );

  const handelSessionEnd = () => {
    endSession();
  };

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
        shortcuts={[
          {
            key: "end-session",
            hidden: !mapSession,
            render: (
              <EndSessionDialog
                handleEndSession={handelSessionEnd}
                loading={isEndingSessionPending}
                trigger={
                  <StablePressable className="p-1">
                    <Icon
                      as={Play}
                      size={28}
                      color={hslToHex(
                        isDarkColorScheme
                          ? THEME.dark.destructive
                          : THEME.light.destructive,
                      )}
                    />
                  </StablePressable>
                }
              />
            ),
          },
          {
            key: "filter",
            icon: ArrowDownNarrowWide,
            onPress: () => setOpenUserFilters(true),
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
      ) : (
        <SessionStarter className="px-4" />
      )}
      <UsersFilter
        className="max-h-[80vh] w-[90vw]"
        open={openUserFilters}
        onOpenChange={setOpenUserFilters}
      />
    </StableSafeAreaView>
  );
};
