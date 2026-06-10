//Deprecated
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { router } from "expo-router";
import { Edit, Verified } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { PremiumCarousel } from "../deprecated/premium/PremiumCarousel";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { useServerImages } from "@/hooks/content/useServerImages";

interface ProfileEntryProps {
  className?: string;
}

export const ProfileEntry = ({ className }: ProfileEntryProps) => {
  const { currentUser, refetchCurrentUser } = useCurrentUser();

  const identification = React.useMemo(() => {
    return identifyUser(currentUser);
  }, [currentUser]);

  const fallback = React.useMemo(() => {
    return identifyUserAvatar(currentUser);
  }, [currentUser]);

  const { jsxArray: profilePictures } = useServerImages({
    ids: [currentUser?.pictureId],
    fallbacks: [fallback],
    className: "border-2 border-border",
    size: { width: 80, height: 80 },
  });

  return (
    <View>
      <View className={cn("flex flex-row items-center gap-4 my-5", className)}>
        <View className="rounded-full">{profilePictures[0]}</View>
        <View className="flex flex-col gap-4">
          <View className="flex flex-row items-center gap-2">
            <Text variant={"large"}>{identification}</Text>
            <Icon as={Verified} size={24} />
          </View>
          <Button
            size={"sm"}
            variant={"secondary"}
            onPress={() => router.push("/main/profile/update-profile")}
          >
            <Icon as={Edit} />
            <Text>Complete Profile</Text>
          </Button>
        </View>
      </View>

      <PremiumCarousel />
    </View>
  );
};
