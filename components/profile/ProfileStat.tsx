import React from "react";
import { cn } from "~/lib/utils";
import { Pressable, View } from "react-native";
import { Pencil } from "lucide-react-native";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { hslToHex, THEME } from "@/lib/theme";
import { router } from "expo-router";

interface ProfileStatProps {
  className?: string;
}

const PRIMARY = hslToHex(THEME.light.primary);

export const ProfileStat = ({ className }: ProfileStatProps) => {
  return (
    <View className={cn(className)}>
      <Pressable
        onPress={() => router.push("/main/profile/update-profile")}
        className="flex-row items-center gap-1.5 rounded-xl border px-3.5 py-2 active:opacity-80"
        style={{ borderColor: `${PRIMARY}40`, backgroundColor: `${PRIMARY}10` }}
      >
        <Icon as={Pencil} size={16} color={PRIMARY} />
        <Text className="text-md font-semibold">Edit profile</Text>
      </Pressable>
    </View>
  );
};
