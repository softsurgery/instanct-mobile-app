import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser } from "@/types";
import _ from "lodash";
import { useColorScheme } from "nativewind";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import MapView from "react-native-map-clustering";
import { Marker, Region } from "react-native-maps";
import Modal from "react-native-modal";
import { UsersCarousel } from "./UserCarousel/UsersCarousel";
import { UserMarker } from "./UserMarker";
import { UserModalContent } from "./UserModalContent";
import { UsersMarker } from "./UsersMarker";
import { UsersModalContent } from "./UsersModalContent";
import { AndroidDarkMapStyle } from "./utils/AndroidDarkMapStyle";
import { useGlobalMapConfiguration } from "@/hooks/content/configurations/useGlobalMapConfiguration";
import { useCurrentMapConfiguration } from "@/hooks/content/users/useCurrentMapConfiguration";

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
  const mapRef = React.useRef<MapView>(null);
  const superCluster = React.useRef<any>(null);
  const mapStore = useMapStore();

  //global configuration
  const { mapConfiguration, isMapConfigurationPending } =
    useGlobalMapConfiguration();

  //user map configuration
  const {
    mapConfiguration: userMapConfiguration,
    isMapConfigurationPending: isUserMapConfigurationPending,
  } = useCurrentMapConfiguration();

  React.useEffect(() => {
    if (userMapConfiguration) {
      mapStore.setNested("parameters.radius", userMapConfiguration.radius);
      mapStore.setNested("parameters.rangeMin", mapConfiguration?.rangeMin);
      mapStore.setNested("parameters.rangeMax", mapConfiguration?.rangeMax);
    }
  }, [userMapConfiguration]);

  //states
  const [selectedUser, setSelectedUser] = React.useState<NearbyUser | null>(
    null,
  );
  const [clusterUsers, setClusterUsers] = React.useState<NearbyUser[] | null>(
    null,
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

  //handle marker press
  const handleMarkerPress = (
    latitude: number,
    longitude: number,
    userId: string,
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
        500,
      );
    }

    const nearbyUser = mapStore.nearbyUsers.find((u) => u.userId === userId);
    const user = mapStore.users.find((u) => u.id === userId);
    if (nearbyUser && user) setSelectedUser({ ...nearbyUser, user });
    setModalVisible(true);
  };

  const handleClusterPress = (nearbyUser: NearbyUser[] | null) => {
    if (!nearbyUser || nearbyUser.length === 0) return;

    const unique = Array.from(
      new Map(nearbyUser.map((u) => [u.userId, u])).values(),
    );

    if (unique.length === 1 && unique[0].userId !== currentUser?.id) {
      handleMarkerPress(
        unique[0].latitude,
        unique[0].longitude,
        unique[0].userId,
      );
      return;
    }

    setClusterUsers(
      unique
        .filter((u) => u.userId !== currentUser?.id)
        .sort((a, b) => (a?.distance ?? 0) - (b?.distance ?? 0)),
    );
    setModalVisible(true);
  };

  //handle modal close
  const handleCloseModal = () => {
    if (prevRegion && mapRef.current && clusterUsers == null) {
      // @ts-ignore
      mapRef.current?.animateToRegion(prevRegion, 500);
    }
    setModalVisible(false);
    setSelectedUser(null);
    setClusterUsers(null);
  };

  const handleRegionChange = React.useCallback(
    _.throttle((region: Region) => {
      setCurrentRegion(region);
    }, 250),
    [],
  );

  if (
    !currentUser ||
    isMapConfigurationPending ||
    isUserMapConfigurationPending
  )
    return <ActivityIndicator />;
  return (
    <View className={cn("flex-1", className)}>
      <MapView
        key={`${colorScheme}`}
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
        onRegionChange={handleRegionChange}
        showsCompass={false}
        mapType={mapStore.parameters.mode === "map" ? "standard" : "satellite"}
        clusteringEnabled={true}
        renderCluster={(cluster) => {
          const { geometry, properties } = cluster;
          const latitude = geometry.coordinates[1];
          const longitude = geometry.coordinates[0];

          // extract clustered userIds
          const clusterIds = properties.cluster_id
            ? superCluster.current?.getLeaves?.(cluster.id, Infinity)
            : [];

          const nearbyUsers = nearbyUsersAndMyself
            .filter((u) =>
              clusterIds.map((c: any) => c.properties?.id).includes(u.userId),
            )
            .map((nearbyUser) => ({
              ...nearbyUser,
              user: mapStore.users.find((u) => nearbyUser.userId === u.id),
            }));

          return (
            <UsersMarker
              key={cluster.id}
              nearbyUsers={nearbyUsers}
              currentUserIncluded={
                !!nearbyUsers.find(
                  (u) => u.userId === (currentUser?.id as string),
                )
              }
              latitude={latitude}
              longitude={longitude}
              onPress={handleClusterPress}
            />
          );
        }}
      >
        {nearbyUsersAndMyself.map((u) => (
          <Marker
            key={u.userId}
            id={u.userId}
            anchor={{ x: 0.5, y: 0.5 }}
            coordinate={{ latitude: u.latitude, longitude: u.longitude }}
            onPress={() => {
              if (u.userId !== currentUser?.id)
                handleMarkerPress(u.latitude, u.longitude, u.userId);
            }}
          >
            <UserMarker
              userId={u.userId}
              isOnline={u.isOnline}
              isCurrentUser={u.userId === currentUser?.id}
            />
          </Marker>
        ))}
      </MapView>
      <Modal
        isVisible={modalVisible}
        onBackdropPress={handleCloseModal}
        onSwipeComplete={handleCloseModal}
        swipeDirection="down"
        backdropOpacity={0}
        style={{
          margin: 0,
          flex: 1,
          justifyContent: "flex-end",
        }}
        coverScreen={false}
      >
        {selectedUser ? (
          <UserModalContent
            nearbyUser={selectedUser}
            closeModal={handleCloseModal}
          />
        ) : null}
        {clusterUsers ? (
          <UsersModalContent
            clusterUsers={clusterUsers}
            closeModal={handleCloseModal}
          />
        ) : null}
      </Modal>
      <View className="py-4 absolute bottom-0 left-0 right-0 bg-background/50 rounded-t-2xl">
        <UsersCarousel
          users={mapStore.nearbyUsers}
          className="rounded-full"
          onUserPress={(user) =>
            handleMarkerPress(user.latitude, user.longitude, user.userId)
          }
        />
      </View>
    </View>
  );
};
