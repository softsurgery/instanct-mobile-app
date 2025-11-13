import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Star, UserPlus } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { showToastable } from "react-native-toastable";
import { StablePressable } from "~/components/shared/StablePressable";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { ResponseClientDto, ServerErrorResponse } from "~/types";

import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useFollowSystem } from "@/hooks/content/users/useFollowSystem";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { ClientStore } from "@/stores/useClientStore";
import { Icon } from "~/components/ui/icon";
import { useServerImage } from "~/hooks/content/useServerImage";

interface UserEntryProps {
  className?: string;
  user: ResponseClientDto;
  clientStore: ClientStore;
  closeDialog?: () => void;
}

export const UserEntry = ({
  className,
  user,
  clientStore,
  closeDialog,
}: UserEntryProps) => {
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const {
    isFollowing,
    refetchIsFollowing,
    followUser,
    unfollowUser,
    isFollowPending,
    isUnfollowPending,
  } = useFollowSystem({
    id: user?.id,
    follow: {
      onSuccess: () => {
        refetchIsFollowing();
        queryClient.invalidateQueries({
          queryKey: ["follow-data-count", clientStore?.response?.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["followings", clientStore?.response?.id],
        });
      },
      onError: (err: ServerErrorResponse) => {
        showToastable({ message: err.response?.data.message });
      },
    },
    unfollow: {
      onSuccess: () => {
        refetchIsFollowing();
        queryClient.invalidateQueries({
          queryKey: ["follow-data-count", clientStore?.response?.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["followers", clientStore?.response?.id],
        });
      },
      onError: (err: ServerErrorResponse) => {
        showToastable({ message: err.response?.data.message });
      },
    },
    use: ["is-following"],
  });

  const { jsx: profilePicture } = useServerImage({
    id: user?.profile?.pictureId,
    fallback: identifyUserAvatar(user),
    size: { width: 40, height: 40 },
  });

  return (
    <StablePressable
      className={cn("p-2", className)}
      onPress={() => {
        router.push({
          pathname: "/main/inspect-profile",
          params: { id: user.id },
        });
        closeDialog?.();
      }}
      onPressClassname="bg-secondary/10"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex flex-row justify-between items-center gap-3">
          <View className="w-10 h-10 bg-accent/20 rounded-full items-center justify-center">
            {profilePicture}
          </View>
          <View>
            <Text className="text-base font-medium text-card-foreground">
              {identifyUser(user)}
            </Text>
            <View className="flex-row items-center gap-4 mt-1">
              <View className="flex-row items-center gap-1">
                <Star size={12} color="#fbbf24" fill="#fbbf24" />
                <Text className="text-xs text-muted-foreground">
                  4.9 (127 reviews)
                </Text>
              </View>
            </View>
          </View>
        </View>
        {currentUser?.id !== user.id && (
          <Button
            size="sm"
            onPress={() => (isFollowing ? unfollowUser() : followUser())}
            variant={isFollowing ? "outline" : "default"}
            className="flex flex-row gap-2"
            disabled={isFollowPending || isUnfollowPending}
          >
            {!isFollowing && <Icon as={UserPlus} size={20} />}
            <Text>{isFollowing ? "Following" : "Follow"}</Text>
          </Button>
        )}
      </View>
    </StablePressable>
  );
};
