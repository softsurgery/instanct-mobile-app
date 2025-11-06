import { THEME } from "@/lib/theme";
import { identifyUser } from "@/lib/user";
import { NearbyUser, ResponseClientDto } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { LucideMessageCircle, Search } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { Dimensions, TouchableWithoutFeedback, View } from "react-native";
import MapView, { Region } from "react-native-maps";
import Modal from "react-native-modal";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { UserMarker } from "./UserMarker";

const screenHeight = Dimensions.get("window").height;

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
  const isDarkColorScheme = colorScheme === "dark";
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

    // Then animate to the user's location
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

  return (
    <View className={className}>
      <MapView
        ref={mapRef}
        style={{ flex: 1, ...style }}
        showsUserLocation
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onRegionChangeComplete={(region) => setCurrentRegion(region)}
      >
        {nearbyUsers.map((u) => (
          <UserMarker
            key={u.userId}
            userId={u.userId}
            latitude={u.latitude}
            longitude={u.longitude}
            isOnline={u.isOnline}
            onPress={(user: ResponseClientDto | null) =>
              handleMarkerPress({ ...u, user })
            }
          />
        ))}
      </MapView>

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
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: isDarkColorScheme
                  ? THEME.dark.card
                  : THEME.light.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                minHeight: screenHeight * 0.25,
              }}
            >
              <View className="w-12 h-1.5 bg-muted-foreground/40 self-center rounded-full mb-4" />
              <View className="flex-row items-center gap-3">
                {selectedUser.profilePicture}
                <View>
                  <Text className="text-lg font-semibold">
                    {identifyUser(selectedUser.user) ??
                      `User ${selectedUser.userId}`}
                  </Text>

                  {selectedUser.isOnline ? (
                    <Text className="text-green-600">Online</Text>
                  ) : (
                    <Text>
                      Last seen{" "}
                      {formatDistanceToNow(new Date(selectedUser.updatedAt), {
                        addSuffix: true,
                      })}
                    </Text>
                  )}

                  <Text className="text-sm mt-1">
                    {(selectedUser.distance ?? 0).toFixed(2)} km away
                  </Text>
                </View>
              </View>
              <View className="flex flex-row items-center justify-between gap-2 my-4">
                <Button size="sm" className="flex-1">
                  <Icon as={Search} size={24} />
                  <Text>View profile</Text>
                </Button>
                <Button variant={"secondary"} size="sm" className="flex-1">
                  <Icon as={LucideMessageCircle} size={24} />
                  <Text>Send message</Text>
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}
      </Modal>
    </View>
  );
};
