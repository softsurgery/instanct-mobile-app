import { api } from "@/api";
import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { ResponseUserDto } from "@/types/user-management";
import { LegendList } from "@legendapp/list";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ArrowDownNarrowWide, Bell } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { UserCard } from "./UserCard";
import { Text } from "../ui/text";

interface ExplorePortalProps {
  className?: string;
}

export const ExplorePortal = ({ className }: ExplorePortalProps) => {
  const { t } = useTranslation("common");
  const { newCount, resetCount } = useNotificationContext();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const {
    data: usersResponse,
    isPending: refreching,
    refetch: refrech,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.user.findAll({ join: "objectives,industries" }),
  });

  const users = React.useMemo(() => usersResponse ?? [], [usersResponse]);

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

  return (
    <StableSafeAreaView
      className={cn("flex flex-1 flex-col bg-background", className)}
    >
      <ApplicationHeader
        title={t("screens.explore")}
        shortcuts={[
          {
            icon: ArrowDownNarrowWide,
            onPress: () => {},
          },
          {
            icon: Bell,
            onPress: handleNotificationsPress,
            badgeText: newCount > 0 ? String(newCount) : undefined,
          },
          {
            icon: IconMessageChatbot,
            onPress: handleChatPress,
          },
        ]}
      />
      <View className="flex-1 bg-transparent">
        <LegendList
          data={users}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          recycleItems={true}
          bounces={false}
          alwaysBounceVertical={false}
          alwaysBounceHorizontal={false}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreching}
              onRefresh={refrech}
              progressViewOffset={0}
              enabled={true}
            />
          }
          renderItem={renderItem}
          onScroll={handleScroll}
          contentContainerStyle={{
            paddingHorizontal: 0,
          }}
        />

        <Text className="font-bold mx-auto my-4">
          {currentIndex + 1} / {users.length}
        </Text>
      </View>
    </StableSafeAreaView>
  );
};
