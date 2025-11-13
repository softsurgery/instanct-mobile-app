import { ClientStore } from "@/stores/useClientStore";
import React from "react";
import { View } from "react-native";
import { StablePressable } from "~/components/shared/StablePressable";
import { StableScrollView } from "~/components/shared/StableScrollView";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { UserEntry } from "./UserEntry";

interface ProfileStatProps {
  className?: string;
  clientStore: ClientStore;
}

export const ProfileStat = ({ className, clientStore }: ProfileStatProps) => {
  const [openFollowing, setOpenFollowing] = React.useState(false);
  const [openFollowers, setOpenFollowers] = React.useState(false);

  return (
    <View className={cn(className)}>
      {/* Following */}
      <Dialog open={openFollowing} onOpenChange={setOpenFollowing}>
        <DialogTrigger asChild disabled={clientStore.followings.length === 0}>
          <StablePressable
            className="flex flex-col items-center"
            onPressClassname="opacity-70"
          >
            <Text variant={"large"}>
              {clientStore?.responseFollowCountsDto?.following}
            </Text>
            <Text variant={"muted"}>Following</Text>
          </StablePressable>
        </DialogTrigger>
        <DialogContent className="w-[90vw] p-2">
          <StableScrollView className="flex flex-col max-h-[50vh] overflow-y-scroll pb-4">
            {clientStore.followings.map((f) => (
              <UserEntry
                key={f.id}
                user={f.following}
                clientStore={clientStore}
                className="mt-4"
                closeDialog={() => setOpenFollowing(false)}
              />
            ))}
          </StableScrollView>
        </DialogContent>
      </Dialog>

      {/* Followers */}
      <Dialog open={openFollowers} onOpenChange={setOpenFollowers}>
        <DialogTrigger asChild disabled={clientStore.followers.length === 0}>
          <StablePressable
            className="flex flex-col items-center"
            onPressClassname="opacity-70"
          >
            <Text variant={"large"}>
              {clientStore?.responseFollowCountsDto?.followers}
            </Text>
            <Text variant={"muted"}>Followers</Text>
          </StablePressable>
        </DialogTrigger>
        <DialogContent className="w-[90vw] p-2">
          <StableScrollView className="flex flex-col max-h-[50vh] overflow-y-scroll pb-4">
            {clientStore.followers.map((f) => (
              <UserEntry
                key={f.id}
                user={f.follower}
                clientStore={clientStore}
                className="mt-4"
                closeDialog={() => setOpenFollowers(false)}
              />
            ))}
          </StableScrollView>
        </DialogContent>
      </Dialog>
    </View>
  );
};
