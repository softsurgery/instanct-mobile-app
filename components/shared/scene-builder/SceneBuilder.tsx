import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { View } from "react-native";
import { ApplicationHeader } from "../AppHeader";
import { DynamicScene } from "./types";

interface SceneBuilderProps {
  className?: string;
  scene: DynamicScene;
}

export const SceneBuilder = ({ className, scene }: SceneBuilderProps) => {
  return (
    <View className={className}>
      <ApplicationHeader
        title={scene.name}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => router.back(),
          },
        ]}
        className="border-b border-border pb-2"
      />
      <View className="flex-1 px-4 mt-4">
        <Text></Text>
      </View>
    </View>
  );
};
