import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { router } from "expo-router";
import { ArrowLeft, MapPin, RefreshCw } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { StableScrollView } from "../shared/StableScrollView";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Text } from "../ui/text";
import {
  createSettingRow,
  SettingRow,
  SettingRowConfig,
} from "../settings/SettingsRow";
import { Slider } from "react-native-awesome-slider";
import { runOnJS, useSharedValue } from "react-native-reanimated";

interface MapSettingsProps {
  className?: string;
}

interface MapSettingsSection {
  key: string;
  title: string;
  description: string;
  rows: SettingRowConfig[];
}

export const MapSettings = ({ className }: MapSettingsProps) => {
  const { t } = useTranslation("common");
  const mapStore = useMapStore();

  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [showClusters, setShowClusters] = React.useState(true);
  const [showUsernames, setShowUsernames] = React.useState(true);

  const radiusKm = mapStore.paramaters.radiusKm;
  const updateInterval = mapStore.paramaters.updateInterval;

  const intervalSteps = [5, 10, 15, 30, 60];

  // Shared values
  const sliderProgress = useSharedValue(intervalSteps.indexOf(updateInterval));

  const sliderMin = useSharedValue(0);
  const sliderMax = useSharedValue(intervalSteps.length - 1);

  // Radius limits
  const RADIUS_MIN = 10;
  const RADIUS_MAX = 100;
  const RADIUS_STEP = 5;

  // Shared values
  const radiusProgress = useSharedValue(radiusKm);
  const radiusMin = useSharedValue(RADIUS_MIN);
  const radiusMax = useSharedValue(RADIUS_MAX);

  React.useEffect(() => {
    const index = intervalSteps.indexOf(updateInterval);

    if (index !== -1) {
      sliderProgress.value = index;
    }
  }, [updateInterval]);

  React.useEffect(() => {
    radiusProgress.value = radiusKm;
  }, [radiusKm]);

  const settingsSections: MapSettingsSection[] = [
    {
      key: "display",
      title: "Display Preferences",
      description: "Customize how the map looks and feels.",
      rows: [
        createSettingRow({
          title: "Show User Clusters",
          description: "Group nearby users into clusters",
          rightComponent: (
            <Switch checked={showClusters} onCheckedChange={setShowClusters} />
          ),
        }),
        createSettingRow({
          title: "Show Usernames",
          description: "Display usernames on map markers",
          rightComponent: (
            <Switch
              checked={showUsernames}
              onCheckedChange={setShowUsernames}
            />
          ),
        }),
      ],
    },
    {
      key: "range",
      title: "Discovery Range",
      description: "Control how far you can see other users.",
      rows: [
        createSettingRow({
          component: () => (
            <View className="flex flex-col gap-4">
              {/* Header */}
              <View className="flex flex-row justify-between items-center">
                <View>
                  <Text className="font-semibold text-base">Search Radius</Text>
                  <Text className="text-xs text-muted-foreground">
                    Current: {radiusKm} km
                  </Text>
                </View>

                <Badge variant="outline">
                  <Text className="text-xs font-medium">{radiusKm} km</Text>
                </Badge>
              </View>

              {/* Slider */}
              <View className="flex flex-col gap-3">
                <Slider
                  progress={radiusProgress}
                  minimumValue={radiusMin}
                  maximumValue={radiusMax}
                  step={RADIUS_STEP}
                  hapticMode="step"
                  onValueChange={(value) => {
                    "worklet";

                    runOnJS(mapStore.setNested)(
                      "paramaters.radiusKm",
                      Math.round(value / RADIUS_STEP) * RADIUS_STEP,
                    );
                  }}
                />

                {/* Labels */}
                <View className="flex flex-row justify-between">
                  <Text className="text-xs text-muted-foreground">10 km</Text>
                  <Text className="text-xs text-muted-foreground">100 km</Text>
                </View>
              </View>
            </View>
          ),
        }),
      ],
    },
    {
      key: "updates",
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
        createSettingRow({
          component: () => (
            <View className="flex flex-col gap-4">
              <View className="flex flex-row justify-between items-center">
                <View>
                  <Text className="font-semibold text-base">
                    Update Interval
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Refresh every {updateInterval} seconds
                  </Text>
                </View>
                <Badge variant="outline">
                  <Text className="text-xs font-medium">{updateInterval}s</Text>
                </Badge>
              </View>
              <View className="flex flex-col gap-3">
                <Slider
                  progress={sliderProgress}
                  minimumValue={sliderMin}
                  maximumValue={sliderMax}
                  step={1}
                  hapticMode="step"
                  style={{ width: "100%" }}
                  onValueChange={(value) => {
                    "worklet";

                    // Jump back to JS thread
                    runOnJS(mapStore.setNested)(
                      "paramaters.updateInterval",
                      intervalSteps[Math.round(value)],
                    );
                  }}
                />

                {/* Labels */}
                <View className="flex flex-row justify-between">
                  <Text className="text-xs text-muted-foreground">5s</Text>
                  <Text className="text-xs text-muted-foreground">60s</Text>
                </View>
              </View>
            </View>
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

          {settingsSections.map((section) => (
            <Card key={section.key}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col">
                {section.rows.map((row, index) => {
                  const isLast = index === section.rows.length - 1;
                  return (
                    <View key={index} className="flex flex-col gap-4">
                      <SettingRow className="mt-2" {...row} />
                      {!isLast && <Separator />}
                    </View>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
