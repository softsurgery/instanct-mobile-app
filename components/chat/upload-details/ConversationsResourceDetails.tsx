import React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { createMaterialTopTabNavigator } from "expo-router/js-top-tabs";
import { ConversationMediaDetails } from "./ConversationMediaDetails";

const Tab = createMaterialTopTabNavigator();

interface ConversationResourceDetailsProps {
  id: string;
}

export const ConversationResourceDetails = ({
  id,
}: ConversationResourceDetailsProps) => {
  const conversationId = Number(id);

  return (
    <StableSafeAreaView className="flex-1 bg-card">
      <ApplicationHeader
        title="Media, files and links"
        titleVariant="large"
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => router.back(),
          },
        ]}
        reverse
        classNames={{ wrapper: "border-b border-border pb-2 bg-card" }}
      />

      <Tab.Navigator
        screenOptions={{
          tabBarScrollEnabled: false,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            textTransform: "none",
          },
          tabBarStyle: { backgroundColor: "transparent" },
        }}
        commonOptions={{
          sceneStyle: {
            flex: 1,
          },
        }}
      >
        <Tab.Screen name="Media">
          {() => <ConversationMediaDetails id={conversationId} />}
        </Tab.Screen>
        <Tab.Screen name="Files">
          {() => (
            <View className="flex-1 items-center justify-center mt-10">
              <Text className="text-muted-foreground">No files found</Text>
            </View>
          )}
        </Tab.Screen>
        <Tab.Screen name="Links">
          {() => (
            <View className="flex-1 items-center justify-center mt-10">
              <Text className="text-muted-foreground">No links found</Text>
            </View>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </StableSafeAreaView>
  );
};
