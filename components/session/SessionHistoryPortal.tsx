import { View } from "react-native";
import { LegendList } from "@legendapp/list";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { cn } from "@/lib/utils";
import { ApplicationHeader } from "../shared/AppHeader";
import { Bell } from "lucide-react-native";
import { router } from "expo-router";
import { useUserSessions } from "@/hooks/content/sessions/useUserSessions";
import { Text } from "../ui/text";
import { SessionType, type ResponseSessionDto } from "@/types/session";
import React from "react";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { useNotificationContext } from "@/contexts/NotificationsContext";

interface SessionHistoryPortalProps {
  className?: string;
}

export const SessionHistoryPortal = ({
  className,
}: SessionHistoryPortalProps) => {
  const { sessions } = useUserSessions({
    sessionType: SessionType.MAP_SESSION,
    page: "1",
    limit: "20",
  });
  const { newCount, resetCount } = useNotificationContext();

  const handleNotificationsPress = React.useCallback(() => {
    resetCount();
    router.push("/main/notifications");
  }, [resetCount]);

  const handleChatPress = React.useCallback(() => {
    router.push("/main/chat");
  }, []);

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseSessionDto }) => (
      <View className="p-4 border-b border-border">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-medium">{item.sessionType}</Text>
        </View>
        <Text className="text-sm">
          {item.plannedStart ? new Date(item.plannedStart).toString() : "N/A"}
        </Text>
        <Text className="text-sm">
          {item.plannedEnd ? new Date(item.plannedEnd).toString() : "N/A"}
        </Text>
        <Text className="text-sm">
          {item.createdAt ? new Date(item.createdAt).toString() : "N/A"}
        </Text>
      </View>
    ),
    [],
  );

  return (
    <StableSafeAreaView
      className={cn("flex flex-1 flex-col bg-background", className)}
    >
      <ApplicationHeader
        title={"Sessions"}
        shortcuts={[
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
      <View className="flex-1 my-2">
        <LegendList
          data={sessions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          recycleItems={true}
        />
      </View>
    </StableSafeAreaView>
  );
};
