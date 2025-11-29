import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser } from "@/types";
import { useColorScheme } from "nativewind";
import React from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import MapView from "react-native-map-clustering";
import { Marker, Region } from "react-native-maps";
import Modal from "react-native-modal";
import { UsersCarousel } from "./UserCarousel/UsersCarousel";
import { UserMarker } from "./UserMarker";
import { UserModalContent } from "./UserModalContent";
import { UsersMarker } from "./UsersMarker";
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
  const { currentUser } = useCurrentUser();
  const { colorScheme } = useColorScheme();
  const mapStore = useMapStore();
  const mapRef = React.useRef<MapView>(null);
  const superCluster = React.useRef<any>(null);

  const [selectedUser, setSelectedUser] = React.useState<NearbyUser | null>(
    null
  );
  const [currentRegion, setCurrentRegion] = React.useState<Region | null>(null);
  const [prevRegion, setPrevRegion] = React.useState<Region | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  const nearbyUsersAndMyself = React.useMemo(() => {
    const myself: NearbyUser = {
      latitude,
      longitude,
      userId: currentUser?.id as string,
      distance: 0,
      isOnline: true,
      profilePicture: null,
      updatedAt: new Date().toISOString(),
    };
    return [...mapStore.nearbyUsers, myself];
  }, [currentUser, mapStore.nearbyUsers]);

  const handleMarkerPress = (
    latitude: number,
    longitude: number,
    userId: string
  ) => {
    if (currentRegion) {
      setPrevRegion(currentRegion);
    }

    if (mapRef.current) {
      //@ts-ignore
      mapRef.current.animateToRegion(
        {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0002,
          longitudeDelta: 0.0002,
        },
        500
      );
    }

    const user = mapStore.nearbyUsers.find((u) => u.userId === userId);
    if (user) setSelectedUser(user);
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

  if (!currentUser) return <ActivityIndicator />;
  return (
    <View className={className}>
      <MapView
        ref={mapRef}
        superClusterRef={superCluster}
        style={{ flex: 1, ...style }}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        customMapStyle={
          colorScheme === "dark" ? AndroidDarkMapStyle : undefined
        }
        onRegionChange={(region) => {
          setCurrentRegion(region);
        }}
        clusteringEnabled={true}
        renderCluster={(cluster) => {
          const { geometry, onPress, properties } = cluster;
          const latitude = geometry.coordinates[1];
          const longitude = geometry.coordinates[0];

          // extract clustered userIds
          const clusterIds = properties.cluster_id
            ? superCluster.current?.getLeaves?.(cluster.id, Infinity)
            : [];

          const nearbyUsers = nearbyUsersAndMyself.filter((u) =>
            clusterIds.map((c: any) => c.properties?.id).includes(u.userId)
          );

          return (
            <UsersMarker
              key={cluster.id}
              nearbyUsers={nearbyUsers}
              currentUserIncluded={
                !!nearbyUsers.find(
                  (u) => u.userId === (currentUser?.id as string)
                )
              }
              latitude={latitude}
              longitude={longitude}
              onPress={(users) => {
                if (!users || users.length === 0) return;
                if (users.length === 1) {
                  // act as normal single press
                  handleMarkerPress(
                    users[0].latitude,
                    users[0].longitude,
                    users[0].userId
                  );
                } else {
                  Alert.alert(JSON.stringify(nearbyUsers)); // show carousel users and keep map zoom centered
                  // setModalVisible(true);
                  // mapStore.setModalUsers(users);
                }
              }}
            />
          );
        }}
      >
        {nearbyUsersAndMyself.map((u) => (
          <Marker
            key={u.userId}
            id={u.userId}
            coordinate={{ latitude: u.latitude, longitude: u.longitude }}
            onPress={() => handleMarkerPress(u.latitude, u.longitude, u.userId)}
          >
            <UserMarker
              userId={u.userId}
              isOnline={u.isOnline}
              isCurrentUser={u.userId === currentUser?.id}
            />
          </Marker>
        ))}
      </MapView>

      <View className="py-4 absolute bottom-0 left-0 right-0 bg-background/50 rounded-t-2xl">
        <UsersCarousel
          users={mapStore.nearbyUsers}
          className="rounded-full"
          onUserPress={(user) =>
            handleMarkerPress(user.latitude, user.longitude, user.userId)
          }
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
