import { cn } from "@/lib/utils";
import { router } from "expo-router";
import { View } from "react-native";
import { StablePressable } from "./shared/StablePressable";
import { StableSafeAreaView } from "./shared/StableSafeAreaView";
import { SceneBuilder } from "./shared/scene-builder/SceneBuilder";
import { Text } from "./ui/text";
import { useSceneBuilderStore } from "./shared/scene-builder/useSceneBuilderStore";

interface EditScreenProps {
  className?: string;
  id: string;
}

export const EditScreen = ({ className, id }: EditScreenProps) => {
  const { scenes } = useSceneBuilderStore();
  return (
    <StableSafeAreaView className={cn("flex-1 bg-background", className)}>
      {scenes?.[id] ? (
        <SceneBuilder scene={scenes?.[id]} />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text variant={"h1"} className="text-center text-red-500">
            404
          </Text>
          <StablePressable className="p-2 rounded-lg" onPress={router.back}>
            <Text variant={"h3"} className="text-center">
              Go Back
            </Text>
          </StablePressable>
        </View>
      )}
    </StableSafeAreaView>
  );
};
