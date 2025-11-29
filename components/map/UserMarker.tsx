import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { useServerImage } from "@/hooks/content/useServerImage";
import { usePulseAnimation } from "@/hooks/usePulseAnimation";
import { identifyUserAvatar } from "@/lib/user";
import { useMapStore } from "@/stores/useMapStore";
import React from "react";
import { Animated, Platform, View } from "react-native";
import { Text } from "../ui/text";

interface UserMarkerProps {
  userId: string;
  isOnline?: boolean;
  isCurrentUser?: boolean;
}

export const UserMarker = ({
  userId,
  isOnline,
  isCurrentUser = false,
}: UserMarkerProps) => {
  const width = 50;
  const height = 50;
  const activeBackgroundColor = "rgba(34,197,94,0.8)";

  const mapStore = useMapStore();
  const { user } = useIdentifiedUser({ id: userId });

  React.useEffect(() => {
    if (user) mapStore.addUser(user);
  }, [user]);

  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsx: profilePicture } = useServerImage({
    id: user?.profile?.pictureId,
    fallback,
    className: "rounded-full",
    size: { width, height },
  });

  //pulse animation
  const { scale, opacity } = usePulseAnimation({ active: isOnline });

  const OnlinePulseBlock = () => {
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
      <View className="flex flex-col items-center justify-center w-full h-full">
        <View>
          {/* Online pulsing highlight */}
          {isOnline ? <OnlinePulseBlock /> : null}
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
        <Text className="mt-1 text-xs font-extrabold bg-background/50 px-2 py-1 rounded-lg text-center">
          {!isCurrentUser ? user?.username : "You"}
        </Text>
      </View>
    );
  return (
    <View>
      {isOnline ? <OnlinePulseBlock /> : null}
      {profilePicture}
    </View>
  );
};
