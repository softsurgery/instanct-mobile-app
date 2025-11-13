import { useServerImage } from "@/hooks/content/useServerImage";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { NearbyUser } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import { Calendar, LucideMessageCircle } from "lucide-react-native";
import React from "react";
import { TouchableWithoutFeedback, View } from "react-native";
import { StablePressable } from "../shared/StablePressable";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";

interface UserModalContentProps {
  className?: string;
  nearbyUser: NearbyUser;
  closeModal?: () => void;
}

export const UserModalContent = ({
  className,
  nearbyUser,
  closeModal,
}: UserModalContentProps) => {
  const identification = React.useMemo(
    () => identifyUser(nearbyUser.user),
    [nearbyUser.user]
  );

  const fallback = React.useMemo(
    () => identifyUserAvatar(nearbyUser.user),
    [nearbyUser.user]
  );
  const { jsx: profilePicture } = useServerImage({
    id: nearbyUser?.user?.profile?.pictureId,
    fallback,
    className: "rounded-full",
    size: { width: 50, height: 50 },
  });

  return (
    <TouchableWithoutFeedback>
      <View className={cn("bg-card rounded-t-2xl p-4 pb-8 ", className)}>
        <View className="w-12 h-1.5 bg-muted-foreground/40 self-center rounded-full mb-4" />
        <View className="flex-row items-center gap-3">
          <StablePressable
            onPress={() => {
              closeModal?.();
              router.push({
                pathname: "/main/inspect-profile",
                params: { id: nearbyUser?.user?.id },
              });
            }}
          >
            {profilePicture}
          </StablePressable>
          <View>
            <Text className="text-lg font-semibold">{identification}</Text>

            {nearbyUser.isOnline ? (
              <Text className="text-green-600">Online</Text>
            ) : (
              <Text>
                Last active{" "}
                {formatDistanceToNow(new Date(nearbyUser.updatedAt), {
                  addSuffix: true,
                })}
              </Text>
            )}

            <Text className="text-xs mt-1">
              {(nearbyUser.distance ?? 0).toFixed(2)} km away
            </Text>
          </View>
        </View>
        <View className="flex flex-row items-center justify-between gap-2 my-4">
          <Button variant={"default"} size="sm" className="flex-1">
            <Icon as={Calendar} size={24} />
            <Text>Check Schedule</Text>
          </Button>
          <Button variant={"outline"} size="sm" className="flex-1">
            <Icon as={LucideMessageCircle} size={24} />
            <Text>Say Hi!</Text>
          </Button>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
