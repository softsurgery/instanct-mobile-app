import { StablePressable } from "@/components/shared/StablePressable";
import { useServerImage } from "@/hooks/content/useServerImage";
import { identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { NearbyUser } from "@/types";
import React from "react";

interface UserScrollListEntryProps {
  className?: string;
  nearbyUser: NearbyUser;
}

export const UserScrollListEntry = ({
  className,
  nearbyUser,
}: UserScrollListEntryProps) => {
  const fallback = React.useMemo(
    () => identifyUserAvatar(nearbyUser.user),
    [nearbyUser.user]
  );
  const { jsx: profilePicture } = useServerImage({
    id: nearbyUser.user?.profile?.pictureId,
    fallback,
    className: "rounded-full",
    size: { width: 60, height: 60 },
  });

  return (
    <StablePressable
      className={cn(className)}
      onPress={() => {
        alert(JSON.stringify(nearbyUser, null, 2));
      }}
    >
      {profilePicture}
    </StablePressable>
  );
};
