import React from "react";
import { cn } from "~/lib/utils";
import { ClientStore } from "@/stores/useClientStore";
import { View } from "react-native";

interface ProfileStatProps {
  className?: string;
  clientStore: ClientStore;
}

export const ProfileStat = ({ className }: ProfileStatProps) => {
  return <View className={cn(className)}></View>;
};
