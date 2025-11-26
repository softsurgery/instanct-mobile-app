import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser } from "@/types";
import { useColorScheme } from "nativewind";
import React from "react";
import { View } from "react-native";
import MapView from "react-native-map-clustering";
import { Region } from "react-native-maps";
import Modal from "react-native-modal";
import { UsersCarousel } from "./UserCarousel/UsersCarousel";
import { UserMarker } from "./UserMarker";
import { UserModalContent } from "./UserModalContent";
import { AndroidDarkMapStyle } from "./utils/AndroidDarkMapStyle";

interface MapRendererProps {
  className?: string;
  style?: Record<string, any>;
  latitude: number;
  longitude: number;
  nearbyUsers: NearbyUser[];
}

export const MapRenderer = ({
  className,
  style,
  latitude,
  longitude,
}: MapRendererProps) => {
  const { colorScheme } = useColorScheme();
  const mapStore = useMapStore();
  const mapRef = React.useRef<MapView>(null);

  const [selectedUser, setSelectedUser] = React.useState<NearbyUser | null>(
    null
  );
  const [currentRegion, setCurrentRegion] = React.useState<Region | null>(null);
  const [prevRegion, setPrevRegion] = React.useState<Region | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleMarkerPress = (user: NearbyUser) => {
    if (currentRegion) {
      setPrevRegion(currentRegion);
    }

    if (mapRef.current) {
      // @ts-ignore
      mapRef.current.animateToRegion(
        {
          latitude: user.latitude,
          longitude: user.longitude,
          latitudeDelta: 0.0002,
          longitudeDelta: 0.0002,
        },
        500
      );
    }

    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    if (prevRegion && mapRef.current) {
      // @ts-ignore
      mapRef.current?.animateToRegion(prevRegion, 500);
    }
    setSelectedUser(null);
  };

  return (
    <View className={className}>
      <MapView
        ref={mapRef}
        style={{ flex: 1, ...style }}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        clusteringEnabled={true}
        animationEnabled={true}
        onClusterPress={(cluster, markers) => {}}
        customMapStyle={
          colorScheme === "dark" ? AndroidDarkMapStyle : undefined
        }
        onRegionChangeComplete={(region) => {
          setCurrentRegion(region);
        }}
      >
        {mapStore.nearbyUsers.map((u, idx) => (
          <UserMarker
            key={idx}
            userId={u.userId}
            coordinate={{ latitude, longitude }}
            isOnline={u.isOnline}
            onPress={(user) => handleMarkerPress({ ...u, user })}
          />
        ))}
      </MapView>

      <View className="py-4 absolute bottom-0 left-0 right-0 bg-background/50 rounded-t-2xl">
        <UsersCarousel
          users={mapStore.nearbyUsers}
          className="rounded-full"
          onUserPress={(user) => handleMarkerPress({ ...user })}
        />
      </View>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={handleCloseModal}
        onSwipeComplete={handleCloseModal}
        swipeDirection="down"
        style={{
          justifyContent: "flex-end",
          margin: 0,
        }}
        backdropOpacity={0}
      >
        {selectedUser && (
          <UserModalContent
            nearbyUser={selectedUser}
            closeModal={handleCloseModal}
          />
        )}
      </Modal>
    </View>
  );
};
