import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { IconMapPinCog, IconMessageChatbot } from "@tabler/icons-react-native";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { MapRenderer } from "./MapRenderer";
import { MapStatus } from "./MapDebugging/MapStatus";
import { Loader } from "../shared/Loader";
import { useChatContext } from "@/contexts/ChatContext";
import { hslToHex } from "@/lib/theme";
import { useColorPalette } from "@/hooks/useColorPalette";

interface MapPortalProps {
  className?: string;
}

export const MapPortal = ({ className }: MapPortalProps) => {
  const { palette } = useColorPalette();
  const background = hslToHex(palette.background);
  const foreground = hslToHex(palette.foreground);
  const { t } = useTranslation("common");
  const mapStore = useMapStore();
  const { count: chatCount, resetCount: resetChatCount } = useChatContext();
  const { count, resetCount } = useNotificationContext();

  const handleChatPress = React.useCallback(() => {
    resetChatCount();
    router.push("/main/chat");
  }, [resetChatCount]);

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
        <Loader size="large" />
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
          classNames={{
            title:
              mapStore.settings.mode === "map"
                ? "text-foreground"
                : "text-background",
          }}
          shortcuts={[
            {
              key: "settings",
              icon: IconMapPinCog,
              color: mapStore.settings.mode === "map" ? foreground : background,
              onPress: () => router.push("/main/maps/map-settings"),
            },
            {
              key: "notifications",
              icon: Bell,
              color: mapStore.settings.mode === "map" ? foreground : background,
              onPress: () => {
                router.push("/main/notifications");
                resetCount();
              },
              badgeText: count > 0 ? `${count}` : undefined,
            },
            {
              key: "chat",
              icon: IconMessageChatbot,
              color: mapStore.settings.mode === "map" ? foreground : background,
              badgeText: chatCount > 0 ? String(chatCount) : undefined,
              onPress: handleChatPress,
            },
          ]}
        />
        <MapStatus />
        {/* <MapDebugDialog className="m-4" /> */}
      </StableSafeAreaView>
      {/* {!sessionStarted && (
        <MapSessionStarter onStart={() => setSessionStarted(true)} />
      )} */}
    </View>
  );
};
