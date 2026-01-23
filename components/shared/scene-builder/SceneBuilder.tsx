import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { View } from "react-native";
import { ApplicationHeader } from "../AppHeader";
import { DynamicSceneSection } from "./types";
import { cn } from "~/lib/utils";
import React from "react";
import { StableScrollView } from "../StableScrollView";
import { Text } from "@/components/ui/text";
import { SceneRowBuilder } from "./SceneRowBuilder";
import { Separator } from "@/components/ui/separator";

interface SceneBuilderProps {
  className?: string;
  title: string;
  scenes: Record<string, DynamicSceneSection>;
}

export const SceneBuilder = ({
  className,
  title,
  scenes,
}: SceneBuilderProps) => {
  return (
    <View className={cn("flex-1")}>
      <ApplicationHeader
        title={title}
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
          {Object.keys(scenes).map((key) => {
            return (
              <View key={key}>
                <Text className={cn("opacity-60 first:mt-0 m-4 font-normal")}>
                  {scenes?.[key].title}
                </Text>
                <Separator />
                {scenes?.[key]?.rows?.map((row, idx) => {
                  return (
                    <SceneRowBuilder
                      row={row}
                      key={`[{${row.props}}][${idx}]`}
                    />
                  );
                })}
                {scenes?.[key].description ? (
                  <Text className="opacity-60 first:mb-0 m-4 font-normal text-xs">
                    {scenes?.[key].description}
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
