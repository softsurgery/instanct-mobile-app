import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { useTheme } from "@react-navigation/native";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import React from "react";
import { FlatList } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { UserCard } from "./UserCard";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { ResponseUserDto } from "@/types/user-management";

interface ExplorePortalProps {
  className?: string;
}

export const ExplorePortal = ({ className }: ExplorePortalProps) => {
  const isDarkMode = useTheme().dark;
  const { newCount, resetCount } = useNotificationContext();

const { data: usersResponse } = useQuery({
  queryKey: ["users"],
  queryFn: () => api.user.findAll(),
});

  const handleNotificationsPress = React.useCallback(() => {
    resetCount();
    router.push("/main/notifications");
  }, [resetCount]);

  const handleChatPress = React.useCallback(() => {
    router.push("/main/chat");
  }, []);

 const renderItem = React.useCallback(
   ({ item }: { item: ResponseUserDto }) => (
     <UserCard user={item} isDarkMode={isDarkMode} />
   ),
   [],
 );

  return (
    <StableSafeAreaView className={cn("flex-1 bg-background", className)}>
      <ApplicationHeader
        title="Explore"
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
      <FlatList
        data={usersResponse}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        className="px-4"
        contentContainerStyle={{ gap: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </StableSafeAreaView>
  );
};
