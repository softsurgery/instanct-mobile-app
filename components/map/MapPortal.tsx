import { useLiveGeolocation } from "@/hooks/content/geolocation/useLiveGeolocation";
import { NearbyUser } from "@/types";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";

export const MapPortal = () => {
  const { location, nearbyUsers, loading } = useLiveGeolocation({
    updateInterval: 5,
    radiusKm: 4,
  });

  if (loading || !location)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );

  const { latitude, longitude } = location.coords;

  return (
    <MapView
      style={{ flex: 1 }}
      showsUserLocation
      followsUserLocation
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {nearbyUsers.map((u: NearbyUser) => (
        <Marker
          key={u.userId}
          coordinate={{
            latitude: u.latitude,
            longitude: u.longitude,
          }}
          pinColor={u.isOnline ? "blue" : "gray"}
        >
          <Callout>
            <View>
              <Text>User {u.userId}</Text>
              {u.isOnline ? (
                <Text>🟢 Online</Text>
              ) : (
                <Text>
                  Last seen{" "}
                  {formatDistanceToNow(new Date(u.updatedAt), {
                    addSuffix: true,
                  })}
                </Text>
              )}
              <Text>{(u.distance ?? 0).toFixed(2)} km away</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
};
