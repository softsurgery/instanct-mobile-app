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
  }, [nearbyUsers]);

  const { jsxArray: userPictures } = useServerImages({
    ids: users.map((u) => u?.profile?.pictureId),
    className: "rounded-full",
    size: { width: 50, height: 50 },
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
        {/* User Images */}
        <View className="w-12 h-12 flex flex-row items-center justify-center relative">
          {displayUsers.map((user, index) => (
            <View
              key={user.id}
              className="absolute"
              style={{
                left: index * 25,
                zIndex: displayUsers.length - index,
              }}
            >
              {userPictures[index]}
            </View>
          ))}
        </View>

        {/* Centered text */}
        <Text
          className="mt-2 text-xs font-medium bg-background/60 p-1 rounded-lg text-center"
          style={{
            width: 80,
            left: 30,
            opacity: extraCount > 0 ? 1 : 0,
          }}
        >
          + {extraCount} Person
        </Text>
      </View>
    </Marker>
  );
};
