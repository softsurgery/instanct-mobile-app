import React from "react";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { router } from "expo-router";
import { ArrowLeft, MapPin, RefreshCw, Save } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
  createSettingRow,
  SettingRow,
  SettingRowConfig,
} from "../../settings/SettingsRow";
import { ApplicationHeader } from "../../shared/AppHeader";
import { StableSafeAreaView } from "../../shared/StableSafeAreaView";
import StableScrollView from "../../shared/StableScrollView";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { Switch } from "../../ui/switch";
import { Text } from "../../ui/text";
import { Button } from "../../ui/button";
import { Icon } from "../../ui/icon";
import { RadiusSlider } from "./RadiusSlider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { showToastable } from "react-native-toastable";
import { useMapContext } from "@/contexts/MapContext";

interface MapSettingsProps {
  className?: string;
}

interface SettingsSection {
  key: string;
  title: string;
  description: string;
  rows: SettingRowConfig[];
}

export const MapSettings = ({ className }: MapSettingsProps) => {
  const cardClass =
    "border border-b-border border-t-border bg-card shadow-sm overflow-hidden";

  const primaryCardClass =
    "rounded-2xl border border-primary/10 bg-primary/5 shadow-sm overflow-hidden";

  const { t } = useTranslation("common");
  const { restartSocket } = useMapContext();
  const mapStore = useMapStore();
  const queryClient = useQueryClient();

  const [autoRefresh, setAutoRefresh] = React.useState(true);

  const handleRadiusChange = React.useCallback(
    (value: number) => {
      mapStore.setNested("parameters.radius", value);
    },
    [mapStore],
  );

  const settingsRows: SettingsSection[] = [
    {
      key: "display",
      title: "Display Preferences",
      description: "Customize how the map looks and feels.",
      rows: [
        createSettingRow({
          title: "Show User Clusters",
          description: "Group nearby users into clusters",
          rightComponent: (
            <Switch
              checked={mapStore.parameters.clusters}
              onCheckedChange={(value) =>
                mapStore.setNested("parameters.clusters", value)
              }
            />
          ),
        }),
        createSettingRow({
          title: "Show Usernames",
          description: "Display usernames on map markers",
          rightComponent: (
            <Switch
              checked={mapStore.parameters.showUsernames}
              onCheckedChange={(value) =>
                mapStore.setNested("parameters.showUsernames", value)
              }
            />
          ),
        }),
      ],
    },
    {
      key: "discovery",
      title: "Discovery Range",
      description: "Control how far you can see other users.",
      rows: [
        createSettingRow({
          Component: () => (
            <RadiusSlider
              rangeMaxValue={mapStore.parameters.rangeMax}
              rangeMinValue={mapStore.parameters.rangeMin}
              onValueChange={handleRadiusChange}
            />
          ),
        }),
      ],
    },
    {
      key: "location",
      title: "Location Updates",
      description: "Manage how often your location is shared.",
      rows: [
        createSettingRow({
          title: "Auto Refresh",
          description: "Automatically update nearby users",
          leftIcon: RefreshCw,
          rightComponent: (
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          ),
        }),
      ],
    },
    {
      key: "privacy",
      title: "Privacy & Visibility",
      description: "Control who can see you on the map.",
      rows: [
        createSettingRow({
          title: "Location Sharing",
          description: "Currently visible to everyone",
          leftIcon: MapPin,
          rightComponent: (
            <Badge variant="default">
              <Text className="text-xs font-medium">Active</Text>
            </Badge>
          ),
        }),
      ],
    },
  ];

  const {
    mutate: updateMapConfiguration,
    isPending: isUpdateMapConfigurationPending,
  } = useMutation({
    mutationFn: async () => {
      await api.user.updateMapConfiguration({
        radius: mapStore.parameters.radius,
        clusters: mapStore.parameters.clusters,
        showUsernames: mapStore.parameters.showUsernames,
      });
    },
    onSuccess: () => {
      restartSocket();
      queryClient.invalidateQueries({
        queryKey: ["current-map-configuration"],
      });
      router.push("/main/(tabs)/map");
    },
  });

  const handleMapConfigurationUpdate = () => {
    updateMapConfiguration();
    showToastable({
      title: "Map configuration updated",
      status: "success",
      message: "Your map configuration has been successfully updated.",
    });
  };

  const isPending = isUpdateMapConfigurationPending;

  if (isPending) return null;
  return (
    <StableSafeAreaView className={cn("flex flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={t("screens.mapSettings")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => router.back(),
          },
        ]}
      />
      <StableScrollView>
        <View className="flex flex-col gap-4 py-4 pb-4">
          {/* Header Card */}
          <View className="px-4 mb-4">
            <View className={cn(primaryCardClass)}>
              <View className="p-4 flex flex-col gap-2">
                <View className="flex flex-row items-center justify-between">
                  <Text variant="h4">Map Configuration</Text>
                  <Badge variant="outline">
                    <Text className="text-xs font-medium">
                      {mapStore.connected ? "Connected" : "Offline"}
                    </Text>
                  </Badge>
                </View>
                <Text variant="muted">
                  Customize your map experience and discovery preferences.
                  Changes apply instantly.
                </Text>
              </View>
            </View>
          </View>

          {/* Settings Sections */}
          {settingsRows.map((section) => (
            <View key={section.key} className={cardClass}>
              <View className="px-8 py-4 bg-background/75 mb-4">
                <Text className="text-lg font-semibold">{section.title}</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  {section.description}
                </Text>
              </View>

              <View className="px-4 pb-4 flex flex-col">
                {section.rows.map((row, index) => (
                  <View key={index} className="flex flex-col gap-2 px-4">
                    <SettingRow className="mt-1" {...createSettingRow(row)} />
                    {index < section.rows.length - 1 && (
                      <Separator className="mb-2" />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </StableScrollView>

      <View className="py-4 border-t-2 border-border">
        <Button
          size="sm"
          className="mx-6 mb-4 rounded-full"
          onPress={handleMapConfigurationUpdate}
        >
          <Icon as={Save} size={16} />
          <Text>Update Configuration</Text>
        </Button>
      </View>
    </StableSafeAreaView>
  );
};
