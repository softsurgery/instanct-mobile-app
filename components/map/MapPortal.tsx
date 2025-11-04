import * as Location from "expo-location";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

interface MapPortalProps {
  className?: string;
}

export const MapPortal = ({ className }: MapPortalProps) => {
  const [region, setRegion] = React.useState<Region | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      // Ask for permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        setLoading(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {region && (
        <MapView
          className="w-screen h-screen"
          style={{ flex: 1 }}
          showsUserLocation={true}
          followsUserLocation={true}
          region={region}
        >
          <Marker coordinate={region} title="You are here" />
        </MapView>
      )}
    </View>
  );
};
