import { useCurrentUser } from "@/hooks/content/useCurrentUser";
import { useServerImage } from "@/hooks/content/useServerImage";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Verified } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";

interface ProfileEntryProps {
  className?: string;
}

export const ProfileEntry = ({ className }: ProfileEntryProps) => {
  const authPersistStore = useAuthPersistStore();
  const queryClient = useQueryClient();
  const { currentUser, refetchCurrentUser } = useCurrentUser();

  const signout = () => {
    authPersistStore.logout?.();
    queryClient.clear();
    router.replace("/");
  };

  const identification = React.useMemo(() => {
    return identifyUser(currentUser);
  }, [currentUser]);

  const fallback = React.useMemo(() => {
    return identifyUserAvatar(currentUser);
  }, [currentUser]);

  const { jsx: profilePicture } = useServerImage({
    id: currentUser?.profile?.pictureId,
    fallback,
    className: "border-2 border-border",
    size: { width: 80, height: 80 },
  });

  return (
    <View>
      <View className="flex flex-row items-center gap-4 p-2 my-5">
        <View className="rounded-full">{profilePicture}</View>
        <View className="flex flex-col gap-4">
          <View className="flex flex-row justify-center items-center gap-2">
            <Text variant={"large"}>{identification}</Text>
            <Icon as={Verified} size={24} />
          </View>
          <Button size={"sm"} variant={"outline"}>
            <Text>Complete Profile</Text>
          </Button>
        </View>
      </View>
      <View className="flex flex-row gap-4">
        <Button className="flex-1" onPress={() => refetchCurrentUser()}>
          <Text>Refresh</Text>
        </Button>

        <Button className="flex-1" variant={"destructive"} onPress={signout}>
          <Text>Signout</Text>
        </Button>
      </View>
    </View>
  );
};
