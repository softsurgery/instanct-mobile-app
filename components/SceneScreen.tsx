import { router } from "expo-router";
import { View } from "react-native";
import { StableSafeAreaView } from "./shared/StableSafeAreaView";
import { cn } from "~/lib/utils";
import { Text } from "~/components/ui/text";
import { StablePressable } from "./shared/StablePressable";
import React from "react";
import { useSceneBuilderStore } from "./shared/scene-builder/useSceneBuilderStore";

interface SceneScreenProps {
  id: string;
  className?: string;
}

export const SceneScreen = ({ className, id }: SceneScreenProps) => {
  const { scenes } = useSceneBuilderStore();
  const scene = scenes?.[id];
  if (!scene)
    return (
      <View className={cn("flex-1 items-center justify-center", className)}>
        <Text variant={"h1"} className="text-center text-primary">
          404
        </Text>
        <StablePressable className="p-2 rounded-lg" onPress={router.back}>
          <Text variant={"h3"} className="text-center">
            Go Back
          </Text>
        </StablePressable>
      </View>
    );
  return (
    <StableSafeAreaView className={cn("flex-1 bg-card")}>
      {
        <scene.component
          className={cn(
            "flex flex-col flex-1 gap-10 py-4 px-1 pb-10",
            className,
          )}
          {...scene.props}
        />
      }
    </StableSafeAreaView>
  );
};
