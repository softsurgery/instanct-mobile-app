import { useMapContext } from "@/contexts/MapContext";
import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { router } from "expo-router";
import { Bell, RefreshCcw, Settings } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { MapModes } from "./MapModes";
import { MapRenderer } from "./MapRenderer";
import { MapSessionStarter } from "./MapSessionStarter";
import { MapStatus } from "./MapDebugging/MapStatus";
import { MapDebugDialog } from "./MapDebugging/MapDebugDialog";

interface MapPortalProps {
  className?: string;
}

export const MapPortal = ({ className }: MapPortalProps) => {
  const { t } = useTranslation("common");
  const [sessionStarted, setSessionStarted] = React.useState(false);
  const mapStore = useMapStore();
  const { newCount, resetCount } = useNotificationContext();
  const { restartSocket } = useMapContext();

  const { latitude, longitude } = mapStore?.location?.coords || {
    latitude: 0,
    longitude: 0,
  };

  if (!mapStore.location) {
    return (
      <View
        className={cn(
          "flex-1 items-center justify-center bg-background",
          className,
        )}
      >
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className={cn("flex-1 bg-background", className)}>
      <View className="absolute inset-0 border-y border-border top-0">
        <MapRenderer
          className="flex-1"
          latitude={latitude}
          longitude={longitude}
          nearbyUsers={mapStore.nearbyUsers}
        />
      </View>

      <StableSafeAreaView className="absolute top-0 left-0 right-0 z-20">
        <ApplicationHeader
          title={t("screens.map")}
          shortcuts={[
            {
              icon: Settings,
              onPress: () => router.push("/main/maps/map-settings"),
            },
            {
              icon: RefreshCcw,
              onPress: () => {
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
        <MapDebugDialog className="m-4" />
      </StableSafeAreaView>
      {/* Navigation Mode */}
      <MapModes setSessionStarted={setSessionStarted} />
      {!sessionStarted && (
        <MapSessionStarter onStart={() => setSessionStarted(true)} />
      )}
    </View>
  );
};
