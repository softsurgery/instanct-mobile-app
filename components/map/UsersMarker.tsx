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
  onPress: (users: NearbyUser[] | null) => void;
}

export const UsersMarker = ({
  nearbyUsers,
  latitude,
  longitude,
  onPress,
}: UsersMarkerProps) => {
  const mapStore = useMapStore();

  const users = React.useMemo(() => {
    return mapStore.users.filter((u) =>
      nearbyUsers.some((nu) => nu.userId === u.id)
    );
  }, [nearbyUsers, mapStore.users]);

  const { jsxArray: userPictures } = useServerImages({
    ids: users.map((u) => u?.profile?.pictureId),
    className: "rounded-full",
    size: { width: 40, height: 40 },
    fallbacks: users.map((u) => identifyUserAvatar(u)),
  });

  const displayUsers = users.slice(0, 3);
  const extraCount = users.length - 3;

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
          {users.length} Person{users.length > 1 ? "s" : ""}
        </Text>
      </View>
    </Marker>
  );
};
