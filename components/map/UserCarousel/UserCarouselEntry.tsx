import { StablePressable } from "@/components/shared/StablePressable";
import { useServerImage } from "@/hooks/content/useServerImage";
import { identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import React from "react";

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
    [userId, mapStore.users]
  );
  const nearbyUser = React.useMemo(
    () => mapStore.getNearbyUserById(userId),
    [userId]
  );
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);
  const { jsx: profilePicture } = useServerImage({
    id: user?.profile?.pictureId,
    fallback,
    className: "rounded-full",
    size: { width: 50, height: 50 },
  });

  return (
    <StablePressable
      className={cn(className)}
      onPress={() => onPress?.({ ...nearbyUser, user })}
    >
      {profilePicture}
    </StablePressable>
  );
};
