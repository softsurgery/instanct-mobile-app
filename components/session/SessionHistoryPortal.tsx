import { View } from "react-native";
import { LegendList } from "@legendapp/list";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { cn } from "@/lib/utils";
import { ApplicationHeader } from "../shared/AppHeader";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useUserSessions } from "@/hooks/content/sessions/useUserSessions";
import { Text } from "../ui/text";
import { SessionType, type ResponseSessionDto } from "@/types/session";
import React from "react";

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
      </View>
    ),
    [],
  );

  return (
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={"Sessions History"}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => {
              router.back();
            },
          },
        ]}
      />
      <View className="flex-1 bg-background">
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
