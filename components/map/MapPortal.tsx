import { useGeolocationContext } from "@/contexts/GeolocationContext";
import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { MapRenderer } from "./MapRenderer";
import { UsersScrollList } from "./UserScrollList/UsersScrollList";

interface MapPortalProps {
  className?: string;
}

export const MapPortal = ({ className }: MapPortalProps) => {
  const { newCount, resetCount } = useNotificationContext();
  const { location, nearbyUsers, loading } = useGeolocationContext();
  if (loading || !location)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );

  const { latitude, longitude } = location.coords;

  return (
    <StableSafeAreaView className={cn("", className)}>
      <ApplicationHeader
        title="Map"
        className="mb-2 mx-2"
        shortcuts={[
          {
            icon: Bell,
            onPress: () => {
              router.push("/main/notifications");
              resetCount();
            },
            badgeText: newCount > 0 ? `${newCount}` : undefined,
          },
        ]}
      />
      <View className="flex-1 flex flex-col justify-between">
        <MapRenderer
          className="flex-[8] border-y border-border"
          latitude={latitude}
          longitude={longitude}
          nearbyUsers={nearbyUsers}
        />
        <View className="flex-1 bg-card/75">
          <UsersScrollList users={nearbyUsers} />
        </View>
      </View>
    </StableSafeAreaView>
  );
};
