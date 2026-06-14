import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Maximize2, MapPin, X } from "lucide-react-native";
import React from "react";
import { Dimensions, Modal, Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { AndroidDarkMapStyle } from "@/components/map/utils/AndroidDarkMapStyle";
import { useColorPalette } from "@/hooks/useColorPalette";


const screenHeight = Dimensions.get("window").height;

interface RequestLocationSectionProps {
  className?: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  editable?: boolean;
}

export const RequestLocationSection = ({
  className,
  location,
  latitude,
  longitude,
}: RequestLocationSectionProps) => {
  const { palette, colorScheme } = useColorPalette();
  const insets = useSafeAreaInsets();

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const hasCoordinates =
    latitude != null &&
    longitude != null &&
    !(latitude === 0 && longitude === 0);

  const region = {
    latitude: latitude!,
    longitude: longitude!,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const mapStyle =
  colorScheme === "dark" && Platform.OS === "android" ? AndroidDarkMapStyle : undefined;

  return (
    <View className={cn("gap-3", className)}>
      {/* Lieu row with pen */}
      <View className="flex-row items-start gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-muted/60">
          <Icon as={MapPin} size={17} className="text-primary" />
        </View>
        <View className="flex-1 pt-0.5">
          <Text className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Lieu
          </Text>
          <Text
            className={cn(
              "text-sm leading-5",
              location ? "text-foreground" : "italic text-muted-foreground/70",
            )}
          >
            {location || "Non spécifié"}
          </Text>
        </View>
        {/* {editable && (
          <Pressable
            onPress={onEdit}
            hitSlop={8}
            className="h-8 w-8 items-center justify-center rounded-full active:bg-muted"
          >
            <Icon as={Edit3} size={16} className="text-muted-foreground" />
          </Pressable>
        )} */}
      </View>

      {/* Inline map with expand control */}
      {hasCoordinates && (
        <View className="overflow-hidden rounded-xl mt-4">
          <MapView
            style={{ width: "100%", height: screenHeight * 0.4 }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            initialRegion={region}
            customMapStyle={mapStyle}
          >
            <Marker coordinate={region} pinColor={palette.primary} />
          </MapView>

          {/* expand button */}
          <Pressable
            onPress={() => setIsFullscreen(true)}
            hitSlop={6}
            className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-card/90 active:opacity-80"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
          >
            <Icon as={Maximize2} size={16} className="text-foreground" />
          </Pressable>
        </View>
      )}

      {/* Fullscreen map modal */}
      <Modal
        visible={isFullscreen}
        animationType="slide"
        onRequestClose={() => setIsFullscreen(false)}
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-background">
          {hasCoordinates && (
            <MapView
              style={{ flex: 1 }}
              initialRegion={region}
              showsUserLocation={false}
              customMapStyle={mapStyle}
            >
              <Marker coordinate={region} pinColor={palette.primary} />
            </MapView>
          )}

          {/* close button */}
          <Pressable
            onPress={() => setIsFullscreen(false)}
            hitSlop={8}
            className="absolute h-11 w-11 items-center justify-center rounded-full bg-card/95 active:opacity-80"
            style={{
              top: insets.top + 12,
              right: 16,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
            }}
          >
            <Icon as={X} size={20} className="text-foreground" />
          </Pressable>

          {/* location label pill */}
          {location && (
            <View
              className="absolute left-4 right-4 flex-row items-center gap-2 rounded-2xl bg-card/95 px-4 py-2"
              style={{
                bottom: insets.bottom,
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 4,
              }}
            >
              <Icon as={MapPin} size={16} className="text-primary" />
              <Text
                className="flex-1 text-sm text-foreground py-2"
                numberOfLines={2}
              >
                {location}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};
