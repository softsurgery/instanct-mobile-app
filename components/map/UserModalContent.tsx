import { usePanResponder } from "@/hooks/usePanResponder";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { NearbyUser } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import React from "react";
import { TouchableWithoutFeedback, View } from "react-native";
import { StablePressable } from "../shared/StablePressable";
import { Text } from "../ui/text";
import { useServerImages } from "@/hooks/content/useServerImages";

interface UserModalContentProps {
  className?: string;
  nearbyUser: NearbyUser;
  clusterView?: boolean;
  closeModal?: () => void;
}

export const UserModalContent = ({
  className,
  nearbyUser,
  clusterView = false,
  closeModal,
}: UserModalContentProps) => {
  const { panHandlers } = usePanResponder();

  const identification = React.useMemo(
    () => identifyUser(nearbyUser.user),
    [nearbyUser.user],
  );

  const fallback = React.useMemo(
    () => identifyUserAvatar(nearbyUser.user),
    [nearbyUser.user],
  );
  const { jsxArray: profilePictures } = useServerImages({
    ids: [nearbyUser?.user?.pictureId],
    fallbacks: [fallback],
    className: "rounded-full",
    size: { width: 50, height: 50 },
  });

  const inspectProfile = () => {
    closeModal?.();
    router.push({
      pathname: "/main/profile/inspect-profile",
      params: { id: nearbyUser?.user?.id },
    });
  };

  if (clusterView)
    return (
      <View className={cn("bg-card rounded-t-2xl", className)} {...panHandlers}>
        <View className="flex flex-row justify-between items-center my-4">
          <View className="flex-row items-center gap-3">
            <StablePressable onPress={inspectProfile}>
              {profilePictures[0]}
            </StablePressable>
            <View className="flex flex-col gap-1">
              <Text className="text-md font-semibold">{identification}</Text>
              {nearbyUser.isOnline ? (
                <Text className="text-xs text-green-600">Online</Text>
              ) : (
                <Text className="text-xs opacity-70">
                  Last active{" "}
                  {formatDistanceToNow(new Date(nearbyUser.updatedAt), {
                    addSuffix: true,
                  })}
                </Text>
              )}
              <Text className="text-xs">
                {(nearbyUser.distance ?? 0).toFixed(2)} km away
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  return (
    <TouchableWithoutFeedback>
      <View
        className={cn("bg-card rounded-t-2xl p-6", className)}
        {...panHandlers}
      >
        <View className="w-12 h-1.5 bg-muted-foreground/40 self-center rounded-full mb-4" />
        <View className="flex flex-row justify-between items-center my-4">
          <View className="flex-row items-center gap-3">
            <StablePressable onPress={inspectProfile}>
              {profilePictures[0]}
            </StablePressable>
            <View className="flex flex-col gap-1">
              <Text className="text-md font-semibold">{identification}</Text>
              {nearbyUser.isOnline ? (
                <Text className="text-xs text-green-600">Online</Text>
              ) : (
                <Text className="text-xs opacity-70">
                  Last active{" "}
                  {formatDistanceToNow(new Date(nearbyUser.updatedAt), {
                    addSuffix: true,
                  })}
                </Text>
              )}
              <Text className="text-xs">
                {(nearbyUser.distance ?? 0).toFixed(2)} km away
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
