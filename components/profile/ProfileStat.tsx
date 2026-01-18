import React from "react";
import { cn } from "~/lib/utils";
import { View } from "react-native";

interface ProfileStatProps {
  className?: string;
}

export const ProfileStat = ({ className }: ProfileStatProps) => {
  return <View className={cn(className)}></View>;
};
