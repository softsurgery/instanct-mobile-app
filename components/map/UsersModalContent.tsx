import { usePanResponder } from "@/hooks/usePanResponder";
import { NearbyUser } from "@/types";
import React from "react";
import { ScrollView, View } from "react-native";
import { UserModalContent } from "./UserModalContent";

interface UsersModalContentProps {
  clusterUsers?: NearbyUser[] | null;
  closeModal?: () => void;
}

export const UsersModalContent = ({
  clusterUsers,
  closeModal,
}: UsersModalContentProps) => {
  const { panHandlers } = usePanResponder();
  return (
    <View className="bg-card rounded-t-2xl p-4 pb-8">
      <View
        className="w-12 h-1.5 bg-muted-foreground/40 self-center rounded-full mb-4"
        {...panHandlers}
      />

      <ScrollView style={{ maxHeight: 320 }}>
        {clusterUsers?.map((u) => (
          <UserModalContent
            key={u.userId}
            nearbyUser={u}
            clusterView
            closeModal={closeModal}
          />
        ))}
      </ScrollView>
    </View>
  );
};
