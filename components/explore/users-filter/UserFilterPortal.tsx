import { ApplicationHeader } from "@/components/shared/AppHeader";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { View } from "react-native";
import { UsersFilter } from "./UsersFilter";

export const UserFilterPortal = () => {
  return (
    <StableSafeAreaView className="flex-1 bg-background">
      <ApplicationHeader
        title={"User Filters"}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => router.back(),
          },
        ]}
      />
      <View className="flex-1 mt-2">
        <UsersFilter onApplyPress={() => router.back()} />
      </View>
    </StableSafeAreaView>
  );
};
