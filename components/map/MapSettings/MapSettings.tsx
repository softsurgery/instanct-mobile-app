import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { router } from "expo-router";
import { ArrowLeft, MapPin, RefreshCw, Save } from "lucide-react-native";
import React from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Separator } from "../../ui/separator";
import { Switch } from "../../ui/switch";
import { Text } from "../../ui/text";
import { useCurrentMapConfiguration } from "@/hooks/content/users/useCurrentMapConfiguration";
import { Button } from "../../ui/button";
import { Icon } from "../../ui/icon";
import { useGlobalMapConfiguration } from "@/hooks/content/configurations/useGlobalMapConfiguration";
import { RadiusSlider } from "./RadiusSlider";

interface MapSettingsProps {
  className?: string;
}

export const MapSettings = ({ className }: MapSettingsProps) => {
  const { t } = useTranslation("common");
  const mapStore = useMapStore();

  //global configuration
  const {
    mapConfiguration,
    isMapConfigurationPending,
    refetchMapConfiguration,
  } = useGlobalMapConfiguration();

  //user map configuration
  const {
    mapConfiguration: userMapConfiguration,
    isMapConfigurationPending: isUserMapConfigurationPending,
    refetchMapConfiguration: refetchUserMapConfiguration,
  } = useCurrentMapConfiguration();

  React.useEffect(() => {
    if (userMapConfiguration) {
      mapStore.setNested("parameters.radius", userMapConfiguration.radius || 0);
    }
  }, [userMapConfiguration?.radius]);

  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [showClusters, setShowClusters] = React.useState(true);
  const [showUsernames, setShowUsernames] = React.useState(true);

  const handleRadiusChange = React.useCallback(
    (value: number) => {
      mapStore.setNested("parameters.radius", value);
    },
    [mapStore],
  );

  const handleIntervalChange = React.useCallback(
    (value: number) => {
      mapStore.setNested("parameters.updateInterval", value);
    },
    [mapStore],
  );

  const isPending = isMapConfigurationPending || isUserMapConfigurationPending;

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
      <StableScrollView className="bg-background">
        <View className="flex flex-col gap-4 p-4 pb-10">
          <Card className="border-primary/10 bg-primary/5">
            <CardContent className="flex flex-col gap-2 px-4">
              <View className="flex flex-row items-center justify-between">
                <Text variant="h4">Map Configuration</Text>
                <Badge variant="outline">
                  <Text className="text-xs font-medium">
                    {mapStore.connected ? "Connected" : "Offline"}
                  </Text>
                </Badge>
              </View>
              <Text variant="muted">
                Customize your map experience and discovery preferences. Changes
                apply instantly.
              </Text>
            </CardContent>
          </Card>

          {/* Display Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>
                Customize how the map looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              <View className="flex flex-col gap-4">
                <SettingRow
                  className="mt-2"
                  {...createSettingRow({
                    title: "Show User Clusters",
                    description: "Group nearby users into clusters",
                    rightComponent: (
                      <Switch
                        checked={showClusters}
                        onCheckedChange={setShowClusters}
                      />
                    ),
                  })}
                />
                <Separator />
              </View>
              <View className="flex flex-col gap-4">
                <SettingRow
                  className="mt-2"
                  {...createSettingRow({
                    title: "Show Usernames",
                    description: "Display usernames on map markers",
                    rightComponent: (
                      <Switch
                        checked={showUsernames}
                        onCheckedChange={setShowUsernames}
                      />
                    ),
                  })}
                />
              </View>
            </CardContent>
          </Card>

          {/* Discovery Range */}
          <Card>
            <CardHeader>
              <CardTitle>Discovery Range</CardTitle>
              <CardDescription>
                Control how far you can see other users.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              <View className="flex flex-col gap-4">
                <SettingRow
                  className="mt-2"
                  {...createSettingRow({
                    component: () => (
                      <RadiusSlider
                        radiusMaxValue={mapConfiguration.rangeMax}
                        radiusMinValue={mapConfiguration.rangeMin}
                        onValueChange={handleRadiusChange}
                      />
                    ),
                  })}
                />
              </View>
            </CardContent>
          </Card>

          {/* Location Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Location Updates</CardTitle>
              <CardDescription>
                Manage how often your location is shared.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              <View className="flex flex-col gap-4">
                <SettingRow
                  className="mt-2"
                  {...createSettingRow({
                    title: "Auto Refresh",
                    description: "Automatically update nearby users",
                    leftIcon: RefreshCw,
                    rightComponent: (
                      <Switch
                        checked={autoRefresh}
                        onCheckedChange={setAutoRefresh}
                      />
                    ),
                  })}
                />
              </View>
            </CardContent>
          </Card>

          {/* Privacy & Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Visibility</CardTitle>
              <CardDescription>
                Control who can see you on the map.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              <View className="flex flex-col gap-4">
                <SettingRow
                  className="mt-2"
                  {...createSettingRow({
                    title: "Location Sharing",
                    description: "Currently visible to everyone",
                    leftIcon: MapPin,
                    rightComponent: (
                      <Badge variant="default">
                        <Text className="text-xs font-medium">Active</Text>
                      </Badge>
                    ),
                  })}
                />
              </View>
            </CardContent>
          </Card>
        </View>
      </StableScrollView>
      <View className="py-4 border-t-2 border-border">
        <Button
          size="sm"
          className="mx-6 mb-4 rounded-full"
          onPress={() => alert(JSON.stringify(userMapConfiguration, null, 2))}
        >
          <Icon as={Save} size={16} />
          <Text>Update Configuration</Text>
        </Button>
      </View>
    </StableSafeAreaView>
  );
};
