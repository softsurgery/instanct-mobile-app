import React from "react";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import {
  createSettingRow,
  SettingRow,
  SettingRowConfig,
} from "../../settings/SettingsRow";
import { ApplicationHeader } from "../../shared/AppHeader";
import { StableSafeAreaView } from "../../shared/StableSafeAreaView";
import { Separator } from "../../ui/separator";
import { Switch } from "../../ui/switch";
import { Text } from "../../ui/text";
import { Button } from "../../ui/button";
import { RadiusSlider } from "./RadiusSlider";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { toast } from "sonner-native";
import { BottomButtonWrapper } from "@/components/shared/BottomButtonBlockWrapper";

import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
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
  const { t } = useTranslation("common");
  const mapStore = useMapStore();

  React.useEffect(() => {
    mapStore.set("draftSettings", mapStore.settings);
    return () => {
      // Reset draft settings when unmounting the component
      mapStore.setNested("draftSettings.radius", mapStore.settings.radius);
      mapStore.setNested("draftSettings.clusters", mapStore.settings.clusters);
      mapStore.setNested(
        "draftSettings.showUsernames",
        mapStore.settings.showUsernames,
      );
    };
  }, []);

  const step = React.useMemo(() => {
    const range = mapStore.parameters.rangeMax - mapStore.parameters.rangeMin;
    return Math.max(1, Math.floor(range / 20));
  }, [mapStore.parameters.rangeMax, mapStore.parameters.rangeMin]);

  const handleDraftRadiusChange = React.useCallback((value: number) => {
    mapStore.setNested("draftSettings.radius", value);
  }, []);

  const [initialRadius] = React.useState(mapStore.settings.radius);

  const StableRadiusRow = React.useMemo(() => {
    return function RadiusRow() {
      const ms = useMapStore();
      return (
        <RadiusSlider
          initialValue={initialRadius}
          rangeMinValue={ms.parameters.rangeMin}
          rangeMaxValue={ms.parameters.rangeMax}
          onValueChange={handleDraftRadiusChange}
          step={step}
        />
      );
    };
  }, [handleDraftRadiusChange, step, initialRadius]);

  const settingsRows: SettingsSection[] = [
    {
      key: "discovery",
      title: "Discovery Range",
      description: "Control how far you can see other users.",
      rows: [
        createSettingRow({
          Component: StableRadiusRow,
        }),
      ],
    },
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
              checked={mapStore.draftSettings.clusters}
              onCheckedChange={(value) =>
                mapStore.setNested("draftSettings.clusters", value)
              }
            />
          ),
        }),
        createSettingRow({
          title: "Show Usernames",
          description: "Display usernames on map markers",
          rightComponent: (
            <Switch
              checked={mapStore.draftSettings.showUsernames}
              onCheckedChange={(value) =>
                mapStore.setNested("draftSettings.showUsernames", value)
              }
            />
          ),
        }),
      ],
    },

    // {
    //   key: "location",
    //   title: "Location Updates",
    //   description: "Manage how often your location is shared.",
    //   rows: [
    //     createSettingRow({
    //       title: "Auto Refresh",
    //       description: "Automatically update nearby users",
    //       leftIcon: RefreshCw,
    //       rightComponent: (
    //         <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
    //       ),
    //     }),
    //   ],
    // },
    // {
    //   key: "privacy",
    //   title: "Privacy & Visibility",
    //   description: "Control who can see you on the map.",
    //   rows: [
    //     createSettingRow({
    //       title: "Location Sharing",
    //       description: "Currently visible to everyone",
    //       leftIcon: MapPin,
    //       rightComponent: (
    //         <Badge variant="default">
    //           <Text className="text-xs font-medium">Active</Text>
    //         </Badge>
    //       ),
    //     }),
    //   ],
    // },
  ];

  const {
    mutate: updateMapConfiguration,
    isPending: isUpdateMapConfigurationPending,
  } = useMutation({
    mutationFn: async () => {
      await api.user.updateMapConfiguration({
        radius: mapStore.draftSettings.radius,
        clusters: mapStore.draftSettings.clusters,
        showUsernames: mapStore.draftSettings.showUsernames,
      });
    },
    onSuccess: () => {
      mapStore.setNested("settings.radius", mapStore.draftSettings.radius);
      mapStore.setNested("settings.clusters", mapStore.draftSettings.clusters);
      mapStore.setNested(
        "settings.showUsernames",
        mapStore.draftSettings.showUsernames,
      );
      mapStore.set("nearbyUsers", []);
      toast.success("Map configuration updated", {
        description: "Your map configuration has been successfully updated.",
      });
      router.push("/main/(tabs)/map");
    },
  });

  const handleMapConfigurationUpdate = () => {
    updateMapConfiguration();
  };

  return (
    <StableSafeAreaView className={cn("flex flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.mapSettings")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <ScrollView className="bg-background">
        <View className="flex flex-col">
          {/* Header Card */}

          {/* Settings Sections */}
          {settingsRows.map((section) => (
            <View
              key={section.key}
              className={
                "border border-b-border border-t-border shadow-sm overflow-hidden"
              }
            >
              <View className="px-8 py-4 bg-card mb-4">
                <Text className="text-lg font-semibold">{section.title}</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  {section.description}
                </Text>
              </View>

              <View className="px-4 pb-4 flex flex-col">
                {section.rows.map((row, index) => (
                  <View key={index} className="flex flex-col gap-2">
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
      </ScrollView>

      <BottomButtonWrapper>
        <Button
          size="lg"
          variant="default"
          className="rounded-xl"
          onPress={() => {
            handleMapConfigurationUpdate();
          }}
          disabled={isUpdateMapConfigurationPending}
        >
          <Text className="text-md font-bold">
            {isUpdateMapConfigurationPending
              ? "Updating..."
              : "Update Configuration"}
          </Text>
        </Button>
      </BottomButtonWrapper>
    </StableSafeAreaView>
  );
};
