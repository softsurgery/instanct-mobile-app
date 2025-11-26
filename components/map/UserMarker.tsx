import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { useServerImage } from "@/hooks/content/useServerImage";
import { usePulseAnimation } from "@/hooks/usePulseAnimation";
import { identifyUserAvatar } from "@/lib/user";
import { useMapStore } from "@/stores/useMapStore";
import { ResponseClientDto } from "@/types";
import React from "react";
import { Animated, Platform, View } from "react-native";
import { MapMarkerProps, Marker } from "react-native-maps";
import { Text } from "../ui/text";

interface UserMarkerProps {
  userId: string;
  isOnline?: boolean;
  onPress: (user: ResponseClientDto | null) => void;
}

export const UserMarker = ({
  userId,
  coordinate,
  isOnline,
  onPress,
  ...props
}: UserMarkerProps & MapMarkerProps) => {
  const width = 50;
  const height = 50;
  const activeBackgroundColor = "rgba(34,197,94,0.8)";

  const mapStore = useMapStore();
  const { user } = useIdentifiedUser({ id: userId });

  React.useEffect(() => {
    if (user) mapStore.addUser(user);
  }, [user]);

  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsx: profilePicture, upload } = useServerImage({
    id: user?.profile?.pictureId,
    fallback,
    className: "rounded-full",
    size: { width, height },
  });

  //pulse animation
  const { scale, opacity } = usePulseAnimation({ active: isOnline });

  const onlinePulseBlock = () => {
    if (isOnline)
      return (
        <Animated.View
          style={{
            width,
            height,
            borderRadius: width / 2,
            position: "absolute",
            backgroundColor: activeBackgroundColor,
            transform: [{ scale }],
            opacity,
          }}
        />
      );
  };

  if (Platform.OS === "ios")
    return (
      <Marker coordinate={coordinate} onPress={() => onPress(user)} {...props}>
        <View className="flex flex-col items-center justify-center w-full h-full">
          <View>
            {/* Online pulsing highlight */}
            {onlinePulseBlock()}
            {/* Avatar */}
            <View
              style={{
                width,
                height,
                borderRadius: width / 2,
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {profilePicture}
            </View>
          </View>

          {/* Username */}
          {user?.username && (
            <Text className="mt-1 text-xs font-extrabold bg-background/50 px-2 py-1 rounded-lg text-center">
              {user.username}
            </Text>
          )}
        </View>
      </Marker>
    );

  return (
    <Marker
      coordinate={coordinate}
      onPress={() => onPress(user)}
      style={{
        backgroundColor: "blue",
      }}
      {...props}
    >
      {onlinePulseBlock()}
      {profilePicture}
    </Marker>
  );
};
