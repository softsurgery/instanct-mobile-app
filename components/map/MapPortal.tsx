import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { MapRenderer } from "./MapRenderer";
import { MapStatus } from "./MapStatus";

interface MapPortalProps {
  className?: string;
}

export const MapPortal = ({ className }: MapPortalProps) => {
  const mapStore = useMapStore();
  const { newCount, resetCount } = useNotificationContext();

  if (mapStore.loading || !mapStore.location || !mapStore.location.coords)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );

  const { latitude, longitude } = mapStore.location.coords;

  return (
    <View className={cn("flex-1", className)}>
      <View className="flex-1 relative">
        <View className="absolute inset-0 border-y border-border top-0">
          <MapRenderer
            className="flex-1"
            latitude={latitude}
            longitude={longitude}
            nearbyUsers={mapStore.nearbyUsers}
          />
        </View>

        <StableSafeAreaView className="absolute top-0 left-0 right-0 z-20 px-2">
          <ApplicationHeader
            title="Map"
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
          <MapStatus />
        </StableSafeAreaView>
      </View>
    </View>
  );
};
