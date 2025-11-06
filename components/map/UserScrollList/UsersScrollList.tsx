import { cn } from "@/lib/utils";
import { NearbyUser } from "@/types";
import React from "react";
import { ScrollView } from "react-native";
import { UserScrollListEntry } from "./UserScrollListEntry";

interface UsersScrollListProps {
  className?: string;
  users: NearbyUser[];
}

export const UsersScrollList = ({ className, users }: UsersScrollListProps) => {
  return (
    <ScrollView
      className={cn(className)}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {users.map((item, index) => (
        <UserScrollListEntry
          className={cn("mx-1 my-auto", index === 0 && "ml-4")}
          key={item.userId}
          nearbyUser={item}
        />
      ))}
    </ScrollView>
  );
};
