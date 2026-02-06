import React from "react";
import { cn } from "~/lib/utils";
import { View } from "react-native";
import { Edit } from "lucide-react-native";
import { Icon } from "../ui/icon";
import { router } from "expo-router";

interface ProfileStatProps {
  className?: string;
}

export const ProfileStat = ({ className }: ProfileStatProps) => {
  return (
    <View className={cn(className)}>
      <Icon
        as={Edit}
        size={24}
        onPress={() => router.push("/main/profile/update-profile")}
      />
    </View>
  );
};
