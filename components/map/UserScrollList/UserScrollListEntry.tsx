import { StablePressable } from "@/components/shared/StablePressable";
import { useServerImage } from "@/hooks/content/useServerImage";
import { identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import React from "react";

interface UserScrollListEntryProps {
  className?: string;
  userId: string;
  onPress?: (user: any) => void;
}

export const UserScrollListEntry = ({
  className,
  userId,
  onPress,
}: UserScrollListEntryProps) => {
  const mapStore = useMapStore();
  const user = React.useMemo(() => mapStore.getUserById(userId), [userId]);
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
