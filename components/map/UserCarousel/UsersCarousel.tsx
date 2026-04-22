import { cn } from "@/lib/utils";
import { NearbyUser } from "@/types";
import React from "react";
import { ScrollView } from "react-native";
import { UserCarouselEntry } from "./UserCarouselEntry";

interface UsersCarouselProps {
  className?: string;
  users: NearbyUser[];
  onUserPress?: (user: any) => void;
}

export const UsersCarousel = ({
  className,
  users,
  onUserPress,
}: UsersCarouselProps) => {
  return (
    <ScrollView
      className={cn(className)}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {users.map((item, index) => (
        <UserCarouselEntry
          className={cn(
            "mx-1 my-auto",
            index === 0 && "ml-3",
            index === users.length - 1 && "mr-3",
          )}
          key={item.userId}
          userId={item.userId}
          onPress={onUserPress}
        />
      ))}
    </ScrollView>
  );
};
