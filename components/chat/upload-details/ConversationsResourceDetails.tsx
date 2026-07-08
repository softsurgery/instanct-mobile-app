import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { createMaterialTopTabNavigator } from "expo-router/js-top-tabs";
import { ConversationMediaDetails } from "./ConversationMediaDetails";
import { ConversationFilesDetails } from "./ConversationFilesDetails";
import { ConversationLinksDetails } from "./ConversationLinksDetails";

import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
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
            render: <AppHeaderBack />,
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
          {() => <ConversationFilesDetails id={conversationId} />}
        </Tab.Screen>
        <Tab.Screen name="Links">
          {() => <ConversationLinksDetails id={conversationId} />}
        </Tab.Screen>
      </Tab.Navigator>
    </StableSafeAreaView>
  );
};
