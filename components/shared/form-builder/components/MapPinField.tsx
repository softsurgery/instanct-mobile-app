import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { ChevronDown, MapPin, Navigation, Pin } from "lucide-react-native";
import React from "react";
import {
  LayoutAnimation,
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  View,
} from "react-native";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import MapView, { MapPressEvent, Marker, Region } from "react-native-maps";
import { AndroidDarkMapStyle } from "@/components/map/utils/AndroidDarkMapStyle";
import type { MapPinFieldProps } from "../types";
import { Button } from "@/components/ui/button";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { useColorPalette } from "@/hooks/useColorPalette";

interface MapPinInputProps extends MapPinFieldProps {
  className?: string;
  placeholder?: string;
  changedOnFocus?: boolean;
}

export default function MapPinField({
  className,
  placeholder,
  latitude,
  longitude,
  locationName,
  onLocationChange,
  editable = true,
  changedOnFocus = false,
}: MapPinInputProps) {
  const { colorScheme, palette } = useColorPalette();

  const sheetRef = React.useRef<ActionSheetRef>(null);
  const mapRef = React.useRef<MapView>(null);

  const [pin, setPin] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(
    latitude != null && longitude != null ? { latitude, longitude } : null,
  );
  const [name, setName] = React.useState(locationName || "");
  const [loading, setLoading] = React.useState(false);
  const rotation = useSharedValue(0);

  // Sync external prop changes
  React.useEffect(() => {
    if (latitude != null && longitude != null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPin({ latitude, longitude });
    }
  }, [latitude, longitude]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (locationName != null) setName(locationName);
  }, [locationName]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const results = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (results.length > 0) {
        const place = results[0];
        const parts = [
          place.name,
          place.street,
          place.district,
          place.city,
          place.region,
        ].filter(Boolean);
        // Deduplicate consecutive equal parts
        const unique = parts.filter((p, i) => i === 0 || p !== parts[i - 1]);
        return unique.join(", ");
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin({ latitude: lat, longitude: lng });

    const placeName = await reverseGeocode(lat, lng);
    setName(placeName);
  };

  const handleConfirm = async () => {
    if (!pin) return;
    await Haptics.selectionAsync();
    onLocationChange?.({
      latitude: pin.latitude,
      longitude: pin.longitude,
      name,
    });
    sheetRef.current?.hide();
  };

  const handleGoToCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      const region: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(region, 500);
    } catch {
      // silently fail
    }
  };

  const initialRegion: Region = pin
    ? {
        latitude: pin.latitude,
        longitude: pin.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 33.8938,
        longitude: 35.5018,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  const toggle = async () => {
    if (!editable) return;
    Keyboard.dismiss();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    rotation.value = withTiming(180, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    });
    sheetRef.current?.show();
    if (changedOnFocus) {
      console.log("changedOnFocus", initialRegion);
      const placeName = await reverseGeocode(
        initialRegion.latitude,
        initialRegion.longitude,
      );
      setName(placeName);
      onLocationChange?.({
        latitude: initialRegion.latitude,
        longitude: initialRegion.longitude,
        name: placeName,
      });
    }
  };

  return (
    <>
      <Button
        disabled={!editable}
        variant="outline"
        className={cn("w-full h-11 rounded-xl p-0 px-2", className)}
        onPress={toggle}
      >
        <View className="flex flex-row items-center justify-between w-full">
          <View className="flex flex-row items-center gap-2">
            <Icon as={Pin} size={16} color={"gray"} />
            <Text className="text-sm">
              {name || placeholder || "Select a location"}
            </Text>
          </View>
          <Icon as={ChevronDown} size={16} color={"gray"} />
        </View>
      </Button>

      {/* Map modal */}
      <ActionSheet
        ref={sheetRef}
        gestureEnabled
        statusBarTranslucent
        defaultOverlayOpacity={0.45}
        containerStyle={{
          backgroundColor: palette.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 32,
          height: "75%",
        }}
      >
        <View className="mb-8">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-foreground">
              Pick a Location
            </Text>
            {loading && <ActivityIndicator size="small" />}
          </View>

          {/* Location preview */}
          {name ? (
            <View className="flex-row items-center gap-2 mb-3 px-1">
              <Icon as={MapPin} size={24} color={palette.primary} />
              <Text
                className="text-base text-muted-foreground flex-1"
                numberOfLines={1}
              >
                {name}
              </Text>
            </View>
          ) : (
            <Text className="text-sm text-muted-foreground mb-3 px-1">
              Tap on the map to drop a pin
            </Text>
          )}

          {/* Map */}
          <View className="flex-1 rounded-xl overflow-hidden mb-4">
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              initialRegion={initialRegion}
              onPress={handleMapPress}
              showsUserLocation
              showsMyLocationButton={false}
              customMapStyle={
                colorScheme === "dark" && Platform.OS === "android"
                  ? AndroidDarkMapStyle
                  : undefined
              }
            >
              {pin && <Marker coordinate={pin} pinColor={palette.primary} />}
            </MapView>

            {/* Current location button */}
            <Pressable
              onPress={handleGoToCurrentLocation}
              className="absolute bottom-3 right-3 bg-background rounded-full p-2.5 shadow-md"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Icon as={Navigation} size={18} color={palette.primary} />
            </Pressable>
          </View>

          {/* Confirm button */}
          <Button
            onPress={handleConfirm}
            disabled={!pin}
            size="lg"
            variant="outline"
            className="rounded-xl"
          >
            <Text
              className={cn(
                "text-md font-bold",
                pin ? "text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Confirm Location
            </Text>
          </Button>
        </View>
      </ActionSheet>
    </>
  );
}
