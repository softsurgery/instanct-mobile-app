import { StablePressable } from "@/components/shared/StablePressable";
import { useServerImage } from "@/hooks/content/useServerImage";
import { identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import React from "react";

interface UserScrollListEntryProps {
  className?: string;
  userId: string;
}

export const UserScrollListEntry = ({
  className,
  userId,
}: UserScrollListEntryProps) => {
  const mapStore = useMapStore();
  const user = React.useMemo(() => mapStore.getUserById(userId), [userId]);
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
      onPress={() => {
        alert(JSON.stringify(user, null, 2));
      }}
    >
      {profilePicture}
    </StablePressable>
  );
};
