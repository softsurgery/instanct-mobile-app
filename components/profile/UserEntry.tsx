import { router } from "expo-router";
import { Star } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { StablePressable } from "~/components/shared/StablePressable";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { ResponseUserDto } from "~/types";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { useServerImage } from "~/hooks/content/useServerImage";
import { UserStore } from "@/stores/useUserStore";

interface UserEntryProps {
  className?: string;
  user: ResponseUserDto;
  useStore: UserStore;
  closeDialog?: () => void;
}

export const UserEntry = ({
  className,
  user,
  useStore,
  closeDialog,
}: UserEntryProps) => {
  const { jsx: profilePicture } = useServerImage({
    id: user?.pictureId,
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
      </View>
    </StablePressable>
  );
};
