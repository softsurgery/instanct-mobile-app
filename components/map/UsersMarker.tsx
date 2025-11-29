import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUserAvatar } from "@/lib/user";
import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser } from "@/types";
import React from "react";
import { View } from "react-native";
import { Marker } from "react-native-maps";
import { Text } from "../ui/text";

interface UsersMarkerProps {
  nearbyUsers: NearbyUser[];
  latitude: number;
  longitude: number;
  currentUserIncluded?: boolean;
  onPress: (users: NearbyUser[] | null) => void;
}

export const UsersMarker = ({
  nearbyUsers,
  latitude,
  longitude,
  currentUserIncluded,
  onPress,
}: UsersMarkerProps) => {
  const { currentUser } = useCurrentUser();
  const mapStore = useMapStore();

  React.useEffect(() => {
    if (currentUser) mapStore.addUser(currentUser);
  }, [nearbyUsers, mapStore.users, currentUser]);

  const { jsxArray: userPictures } = useServerImages({
    ids: mapStore.users.map((u) => u?.profile?.pictureId),
    className: "rounded-full",
    size: { width: 40, height: 40 },
    fallbacks: mapStore.users.map((u) => identifyUserAvatar(u)),
  });

  const displayUsers = mapStore.users.slice(0, 3);

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={() => onPress(nearbyUsers)}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View className="flex flex-col items-center justify-center">
        {/* Overlapping user icons */}
        <View className="flex flex-row items-center justify-center">
          {displayUsers.map((user, index) => (
            <View
              key={user.id}
              style={{
                marginLeft: index === 0 ? 0 : -18,
                zIndex: displayUsers.length - index,
              }}
            >
              {userPictures[index]}
            </View>
          ))}
        </View>

        {/* Label */}
        <Text className="mt-1 text-xs font-extrabold bg-background/60 px-2 py-1 rounded-lg text-center">
          {currentUserIncluded
            ? `You & ${nearbyUsers.length - 1} Person${
                nearbyUsers.length > 1 ? "s" : ""
              }`
            : `${nearbyUsers.length} Person${
                nearbyUsers.length > 1 ? "s" : ""
              }`}
        </Text>
      </View>
    </Marker>
  );
};
