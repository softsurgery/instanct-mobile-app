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
import { Loader } from "../shared/Loader";
import { useChatContext } from "@/contexts/ChatContext";
import { useActiveMapSessionContext } from "@/contexts/ActiveMapSessionContext";
import { hslToHex } from "@/lib/theme";
import { useColorPalette } from "@/hooks/useColorPalette";
import { MapStatus } from "./MapDebugging/MapStatus";
import { MapLockedOverlay } from "./MaplLockedOverlay";

interface MapPortalProps {
  className?: string;
}

export const MapPortal = ({ className }: MapPortalProps) => {
  const mapStore = useMapStore();
  const { activeSession, initialized } = useActiveMapSessionContext();
  const { palette, colorScheme } = useColorPalette();

  const mapHeaderIconColors = React.useMemo(() => {
    if (colorScheme === "light" && mapStore.settings.mode === "sattelite") {
      return hslToHex(palette.background);
    }
    return hslToHex(palette.foreground);
  }, [palette, colorScheme, mapStore.settings.mode]);

  const mapHeaderTitleClassName = React.useMemo(() => {
    if (colorScheme === "light" && mapStore.settings.mode === "sattelite") {
      return "text-background";
    }
    return "text-foreground";
  }, [colorScheme, mapStore.settings.mode]);

  const { t } = useTranslation("common");
  const { count: chatCount } = useChatContext();
  const { count } = useNotificationContext();

  const handleChatPress = React.useCallback(() => {
    router.push("/main/chat");
  }, []);

  const { latitude, longitude } = mapStore?.location?.coords || {
    latitude: 0,
    longitude: 0,
  };

  return (
    <View className={cn("flex-1 bg-background", className)}>
      <View className="absolute inset-0 border-y border-border top-0">
        {activeSession && (!initialized || !mapStore.location) ? (
          <View
            className={cn(
              "flex-1 items-center justify-center bg-background",
              className,
            )}
          >
            <Loader size="large" />
          </View>
        ) : activeSession ? (
          <MapRenderer
            className="flex-1"
            latitude={latitude}
            longitude={longitude}
            nearbyUsers={mapStore.nearbyUsers}
          />
        ) : (
          <MapLockedOverlay className="flex-1" />
        )}
      </View>

      <StableSafeAreaView className="absolute top-0 left-0 right-0 z-20 pb-2">
        <ApplicationHeader
          title={t("screens.map.title")}
          classNames={{
            title: mapHeaderTitleClassName,
          }}
          shortcuts={[
            {
              key: "settings",
              icon: IconMapPinCog,
              color: mapHeaderIconColors,
              onPress: () => router.push("/main/maps/map-settings"),
            },
            {
              key: "notifications",
              icon: Bell,
              color: mapHeaderIconColors,
              onPress: () => {
                router.push("/main/notifications");
              },
              badgeText: count > 0 ? `${count}` : undefined,
            },
            {
              key: "chat",
              icon: IconMessageChatbot,
              color: mapHeaderIconColors,
              badgeText: chatCount > 0 ? String(chatCount) : undefined,
              onPress: handleChatPress,
            },
          ]}
        />
        {activeSession && (
          <MapStatus
            classNames={{
              text: mapHeaderTitleClassName,
            }}
          />
        )}
        {/* <MapDebugDialog className="m-4" /> */}
      </StableSafeAreaView>
      {/* {!sessionStarted && (
        <MapSessionStarter onStart={() => setSessionStarted(true)} />
      )} */}
    </View>
  );
};
