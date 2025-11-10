import { useMapStore } from "@/stores/useMapStore";
import { Cluster, NearbyUser } from "@/types";
import { useColorScheme } from "nativewind";
import React from "react";
import { View } from "react-native";
import MapView, { Region } from "react-native-maps";
import Modal from "react-native-modal";
import { UserMarker } from "./UserMarker";
import { UserModalContent } from "./UserModalContent";
import { UsersScrollList } from "./UserScrollList/UsersScrollList";
import { UsersMarker } from "./UsersMarker";
import { AndroidDarkMapStyle } from "./utils/AndroidDarkMapStyle";
import { groupUsers } from "./utils/grouping";

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
  nearbyUsers,
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
      mapRef.current.animateToRegion(prevRegion, 500);
    }
    setSelectedUser(null);
  };

  const [clusters, setClusters] = React.useState<Cluster[]>(
    groupUsers(nearbyUsers, (currentRegion?.latitudeDelta || 0) * 5000)
  );

  // const clusters = React.useMemo(
  //   () => groupUsers(nearbyUsers, (currentRegion?.latitudeDelta || 0) * 5000),
  //   [nearbyUsers, currentRegion]
  // );

  return (
    <View className={className}>
      <MapView
        ref={mapRef}
        style={{ flex: 1, ...style }}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        // onRegionChangeComplete={(region) => {
        //   setCurrentRegion(region);
        // }}
        customMapStyle={
          colorScheme === "dark" ? AndroidDarkMapStyle : undefined
        }
        showsCompass={false}
        showsMyLocationButton={false}
        onRegionChange={(region) => {
          setCurrentRegion(region);
          setClusters(groupUsers(nearbyUsers, region.latitudeDelta * 5000));
        }}
      >
        {clusters.map((cluster, i) =>
          cluster.users.length === 1 ? (
            <UserMarker
              key={cluster.users[0].userId}
              userId={cluster.users[0].userId}
              latitude={cluster.latitude}
              longitude={cluster.longitude}
              isOnline={cluster.users[0].isOnline}
              onPress={(user) =>
                handleMarkerPress({ ...cluster.users[0], user })
              }
            />
          ) : (
            <UsersMarker
              key={`cluster-${i}`}
              latitude={cluster.latitude}
              longitude={cluster.longitude}
              nearbyUsers={cluster.users}
              onPress={(users) => {
                if (users?.length === 1) {
                  handleMarkerPress(users[0]);
                } else {
                  console.log("Cluster clicked:", users);
                }
              }}
            />
          )
        )}
      </MapView>

      <View className="py-4 absolute bottom-0 left-0 right-0 bg-background/50 rounded-t-2xl">
        <UsersScrollList
          users={mapStore.nearbyUsers}
          className="rounded-full"
          onUserPress={(user: any) => handleMarkerPress({ ...user })}
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
        {selectedUser && <UserModalContent nearbyUser={selectedUser} />}
      </Modal>
    </View>
  );
};
