import { useMapContext } from "@/contexts/MapContext";
import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { router } from "expo-router";
import { Bell, Eye, Globe, RefreshCcw, User } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { Icon } from "../ui/icon";
import { MapRenderer } from "./MapRenderer";
import { MapSessionStarter } from "./MapSessionStarter";
import { MapStatus } from "./MapStatus";

interface MapPortalProps {
  className?: string;
}

export const MapPortal = ({ className }: MapPortalProps) => {
  const [sessionStarted, setSessionStarted] = React.useState(false);
  const mapStore = useMapStore();
  const { newCount, resetCount } = useNotificationContext();
  const { restartSocket } = useMapContext();

  const { latitude, longitude } = mapStore?.location?.coords || {
    latitude: 0,
    longitude: 0,
  };

  const sideIcons = [
    {
      key: "session",
      icon: Eye,
      onPress: () => setSessionStarted(false),
    },
    {
      key: "globe",
      icon: Globe,
    },
    {
      key: "profile",
      icon: User,
      onPress: () => router.push("/main/update-profile"),
    },
  ];
  return (
    <View className={cn("flex-1 bg-background", className)}>
      <View className="absolute inset-0 border-y border-border top-0 ">
        {mapStore.loading || !mapStore.location || !mapStore.location.coords ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <MapRenderer
            className="flex-1"
            latitude={latitude}
            longitude={longitude}
            nearbyUsers={mapStore.nearbyUsers}
          />
        )}
      </View>

      <StableSafeAreaView className="absolute top-0 left-0 right-0 z-20 px-2">
        <ApplicationHeader
          title="Map"
          shortcuts={[
            {
              icon: RefreshCcw,
              onPress: () => {
                mapStore.set("nearbyUsers", []);
                restartSocket();
              },
            },
            {
              icon: Bell,
              onPress: () => {
                router.push("/main/notifications");
                resetCount();
              },
              badgeText: newCount > 0 ? `${newCount}` : undefined,
            },
            {
              icon: IconMessageChatbot,
              onPress: () => {
                router.push("/main/chat");
              },
            },
          ]}
        />
        <MapStatus />
      </StableSafeAreaView>
      {/* Navigation Mode */}
      <View className="flex flex-col bg-background/40 absolute top-32 right-3 z-50 h-auto px-3 py-4 gap-4 items-center justify-center rounded-b-full rounded-t-full">
        {sideIcons.map(({ key, icon, onPress }) => (
          <Icon key={key} as={icon} size={20} onPress={onPress} />
        ))}
      </View>
      {!sessionStarted && (
        <MapSessionStarter onStart={() => setSessionStarted(true)} />
      )}
    </View>
  );
};
