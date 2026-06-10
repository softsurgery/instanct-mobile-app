import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import React from "react";
import { Pressable } from "react-native";

interface UserCarouselEntryProps {
  className?: string;
  userId: string;
  onPress?: (user: any) => void;
}

export const UserCarouselEntry = ({
  className,
  userId,
  onPress,
}: UserCarouselEntryProps) => {
  const mapStore = useMapStore();
  const user = React.useMemo(
    () => mapStore.getUserById(userId),
    [userId, mapStore.users],
  );
  const nearbyUser = React.useMemo(
    () => mapStore.getNearbyUserById(userId),
    [userId],
  );
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);
  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    fallbacks: [fallback],
    className: "rounded-full",
    wrapperClassName: "border-2 border-white bg-white rounded-full shadow-md",
    size: { width: 50, height: 50 },
  });

  return (
    <Pressable
      className={cn(className)}
      onPress={() => onPress?.({ ...nearbyUser, user })}
    >
      {profilePictures[0]}
    </Pressable>
  );
};
