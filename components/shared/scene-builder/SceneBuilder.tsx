import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { View } from "react-native";
import { ApplicationHeader } from "../AppHeader";
import { DynamicScene } from "./types";
import { cn } from "~/lib/utils";
import { Text } from "~/components/ui/text";
import React from "react";
import { Separator } from "~/components/ui/separator";
import { StableScrollView } from "../StableScrollView";
import { SceneRowBuilder } from "./SceneRowBuilder";

interface SceneBuilderProps {
  className?: string;
  scene: DynamicScene;
}

export const SceneBuilder = ({ className, scene }: SceneBuilderProps) => {
  return (
    <View className={cn("flex-1")}>
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
        className="border-b border-border pb-2 bg-transparent"
      />
      <StableScrollView className="bg-background">
        <View
          className={cn(
            "flex flex-col flex-1 gap-10 py-4 px-1 pb-10",
            className,
          )}
        >
          {Object.keys(scene.content).map((key) => {
            return (
              <View key={key}>
                <Text className={cn("opacity-60 first:mt-0 m-4 font-normal")}>
                  {scene.content[key].name.toUpperCase()}
                </Text>
                <Separator />
                {scene.content[key].rows.map((row, idx) => {
                  return (
                    <SceneRowBuilder
                      row={row}
                      key={`[{${row.props}}][${idx}]`}
                    />
                  );
                })}
                {scene.content[key].description ? (
                  <Text className="opacity-60 first:mb-0 m-4 font-normal text-xs">
                    {scene.content[key].description}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </StableScrollView>
    </View>
  );
};
