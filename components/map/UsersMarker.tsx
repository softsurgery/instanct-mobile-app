import { useServerImages } from "@/hooks/content/useServerImages";
import { usePulseAnimation } from "@/hooks/usePulseAnimation";
import { identifyUserAvatar } from "@/lib/user";
import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser } from "@/types";
import React from "react";
import { Animated, View } from "react-native";
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

  const isAnyOnline = nearbyUsers.some((u) => u.isOnline);

  const { scale, opacity } = usePulseAnimation({ active: isAnyOnline });

  const displayUsers = users.slice(0, 3);

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={() => onPress(nearbyUsers)}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {isAnyOnline && (
        <Animated.View
          className="absolute w-12 h-12 rounded-full bg-green-500/60"
          style={{ transform: [{ scale }], opacity }}
        />
      )}

      <View className="w-16 h-12 flex flex-row items-center">
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

        {users.length > 3 && (
          <View
            className="w-12 h-12 rounded-full bg-card border border-foreground items-center justify-center"
            style={{ zIndex: 10 }}
          >
            <Text className="font-bold">+ {users.length - 3}</Text>
          </View>
        )}
      </View>
    </Marker>
  );
};
