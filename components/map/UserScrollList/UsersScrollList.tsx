import { Avatar } from "@/components/shared/StableAvatar";
import { StablePressable } from "@/components/shared/StablePressable";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { NearbyUser } from "@/types";
import * as Haptics from "expo-haptics";
import { Search } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";
import { UserScrollListEntry } from "./UserScrollListEntry";

interface UsersScrollListProps {
  className?: string;
  users: NearbyUser[];
  onUserPress?: (user: any) => void;
}

export const UsersScrollList = ({
  className,
  users,
  onUserPress,
}: UsersScrollListProps) => {
  const onSearchAvatarPress = () => {
    alert("Search");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView
      className={cn(className)}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <StablePressable onPress={onSearchAvatarPress}>
        <Avatar
          className={cn("mx-1 ml-5 my-auto bg-card", className)}
          style={{
            width: 50,
            height: 50,
          }}
        >
          <Icon as={Search} size={24} className="text-primary-foreground" />
        </Avatar>
      </StablePressable>
      {users.map((item, index) => (
        <UserScrollListEntry
          className={cn("mx-1 my-auto")}
          key={item.userId}
          userId={item.userId}
          onPress={onUserPress}
        />
      ))}
    </ScrollView>
  );
};
