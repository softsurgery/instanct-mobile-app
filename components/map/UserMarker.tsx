import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { usePulseAnimation } from "@/hooks/usePulseAnimation";
import { identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import React from "react";
import { Animated, View } from "react-native";
import { Text } from "../ui/text";
import { useServerImages } from "@/hooks/content/useServerImages";

interface UserMarkerProps {
  className?: string;
  userId: string;
  isOnline?: boolean;
  isCurrentUser?: boolean;
}

export const UserMarker = ({
  className,
  userId,
  isOnline,
  isCurrentUser = false,
}: UserMarkerProps) => {
  const width = 40;
  const height = 40;
  const activeBackgroundColor = "rgba(34,197,94,0.8)";

  const mapStore = useMapStore();
  const { user } = useIdentifiedUser({ id: userId });

  React.useEffect(() => {
    if (user) mapStore.addUser(user);
  }, [user]);

  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    fallbacks: [fallback],
    className: "rounded-full",
    wrapperClassName: "bg-foreground/25",
    fallbackClassName: "text-xs",
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

  return (
    <View
      className={cn("flex flex-col items-center justify-center", className)}
      pointerEvents="none"
    >
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
          {profilePictures[0]}
        </View>
      </View>

      {/* Username */}
      {mapStore.settings.showUsernames && (
        <Text className="mt-1 text-xs font-extrabold bg-background/50 p-1 rounded-lg text-center">
          {!isCurrentUser ? user?.username : "You"}
        </Text>
      )}
    </View>
  );
};
