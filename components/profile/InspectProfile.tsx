import { api } from "@/api";
import { Text } from "@/components/ui/text";
import { useFollowSystem } from "@/hooks/content/users/useFollowSystem";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { useServerImage } from "@/hooks/content/useServerImage";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { createClientStore } from "@/stores/useClientStore";
import { ServerErrorResponse } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import { Mail, UserPlus } from "lucide-react-native";
import React from "react";
import { Image, View } from "react-native";
import { showToastable } from "react-native-toastable";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { ProfileStat } from "./ProfileStat";

interface InspectProfileProps {
  className?: string;
  id: string;
}

export const InspectProfile = ({ className, id }: InspectProfileProps) => {
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const storeRef = React.useRef(createClientStore());
  const clientStore = storeRef.current();
  const { user } = useIdentifiedUser({ id });

  const identity = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);
  const { jsx: profilePicture } = useServerImage({
    id: user?.profile?.pictureId,
    fallback,
    wrapperClassName: "border-4 border-primary rounded-full shadow-md",
    size: { width: 100, height: 100 },
  });

  React.useEffect(() => {
    if (user) clientStore.set("response", user);
    navigation.setOptions({
      title: user?.username ?? "Profile",
    });
  }, [user]);

  const {
    isFollowing,
    refetchIsFollowing,
    followers,
    followings,
    refetchFollowers,
    refetchFollowing,
    followUser,
    isFollowPending,
    unfollowUser,
    isUnfollowPending,
  } = useFollowSystem({
    id: clientStore?.response?.id!,
    use: ["is-following", "followers", "followings"],
    follow: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["follow-data-count", clientStore?.response?.id],
        });
        refetchFollowers();
        refetchFollowing();
        refetchIsFollowing();
      },
      onError: (err: ServerErrorResponse) => {
        showToastable({ message: err.response?.data.message });
      },
    },
    unfollow: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["follow-data-count", clientStore?.response?.id],
        });
        refetchFollowers();
        refetchFollowing();
        refetchIsFollowing();
      },
      onError: (err: ServerErrorResponse) => {
        showToastable({ message: err.response?.data.message });
      },
    },
  });

  React.useEffect(() => {
    clientStore.set("followers", followers);
    clientStore.set("followings", followings);
  }, [followers, followings]);

  const { data: followDataCount, isPending: isFollowDataCountPending } =
    useQuery({
      queryKey: ["follow-data-count", user?.id],
      queryFn: () => api.follow.findDataCount(user?.id!),
      enabled: !!user?.id,
    });

  React.useEffect(() => {
    if (followDataCount)
      clientStore.set("responseFollowCountsDto", followDataCount);
  }, [followDataCount]);

  React.useEffect(() => {
    return () => {
      clientStore.reset();
      storeRef.current = null as any;
    };
  }, []);

  const isCurrentUser = React.useMemo(() => {
    return clientStore?.response?.id === user?.id;
  }, [clientStore?.response, user]);

  return (
    <View className={cn("flex-1 bg-background", className)}>
      {/* Cover Image */}
      <View className="relative w-full h-48 bg-card">
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Profile Header */}
      <View className="flex-row items-center px-5 -mt-12">
        {/* Profile Picture */}
        <View className="z-10">{profilePicture}</View>

        {/* Info + Stats */}
        <View className="flex-1 mt-16">
          <View className="flex-row items-center justify-between mx-2">
            <View>
              <Text className="text-xl font-semibold text-foreground">
                {identity}
              </Text>
              {id && (
                <Text className="text-sm text-muted-foreground">
                  @{user?.username}
                </Text>
              )}
            </View>

            {/* Profile Stats */}
            <ProfileStat
              clientStore={clientStore}
              className="flex flex-row gap-4"
            />
          </View>
        </View>
      </View>

      {/* Bio Section */}
      <View className="flex flex-col gap-4 flex-1 px-5 mt-6">
        <View className="flex flex-row w-full justify-between gap-2">
          <Button
            size="sm"
            onPress={() => (isFollowing ? unfollowUser() : followUser())}
            variant={isFollowing ? "outline" : "default"}
            className="flex flex-row flex-1 gap-2 "
            disabled={isFollowPending || isUnfollowPending}
          >
            {!isFollowing && <Icon as={UserPlus} size={20} />}
            <Text>{isFollowing ? "Following" : "Follow"}</Text>
          </Button>
          <Button
            size="sm"
            className="flex flex-row flex-1 gap-2"
            variant="outline"
          >
            <Icon as={Mail} size={20} />
            <Text>Send Message</Text>
          </Button>
        </View>
        <View>
          <Text variant="small" className="text-foreground">
            {user?.profile?.bio || "No bio available."}
          </Text>
        </View>
      </View>
    </View>
  );
};
