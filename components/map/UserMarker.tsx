import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { useServerImage } from "@/hooks/content/useServerImage";
import { usePulseAnimation } from "@/hooks/usePulseAnimation";
import { identifyUserAvatar } from "@/lib/user";
import { useMapStore } from "@/stores/useMapStore";
import { ResponseClientDto } from "@/types";
import React from "react";
import { Animated, View } from "react-native";
import { Marker } from "react-native-maps";
import { Text } from "../ui/text";

interface UserMarkerProps {
  userId: string;
  latitude: number;
  longitude: number;
  isOnline?: boolean;
  onPress: (user: ResponseClientDto | null) => void;
}

interface UserMarkerProps {
  userId: string;
  latitude: number;
  longitude: number;
  isOnline?: boolean;
  onPress: (user: ResponseClientDto | null) => void;
}

export const UserMarker = ({
  userId,
  latitude,
  longitude,
  isOnline,
  onPress,
}: UserMarkerProps) => {
  const mapStore = useMapStore();
  const { user } = useIdentifiedUser({ id: userId });

  React.useEffect(() => {
    if (!user) return;
    mapStore.addUser(user);
  }, [user]);

  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsx: profilePicture } = useServerImage({
    id: user?.profile?.pictureId,
    fallback,
    className: "rounded-full",
    size: { width: 50, height: 50 },
  });

  const { scale, opacity } = usePulseAnimation({ active: isOnline });

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={() => onPress(user)}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {isOnline ? (
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(34,197,94,0.8)",
              transform: [{ scale }],
              opacity,
            },
          ]}
        />
      ) : null}
      <View className="rounded-full overflow-hidden w-fit">
        {profilePicture}
      </View>
      <View>
        <Text className="mt-1 mx-auto text-xs font-medium bg-background/50 p-1 rounded-lg">
          {user?.username}
        </Text>
      </View>
    </Marker>
  );
};
