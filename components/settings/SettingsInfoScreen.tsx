import { cn } from "@/lib/utils";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { StableScrollView } from "../shared/StableScrollView";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Text } from "../ui/text";

interface InfoSection {
  title: string;
  description?: string;
  bullets?: string[];
}

interface SettingsInfoScreenProps {
  className?: string;
  title: string;
  subtitle: string;
  updatedLabel?: string;
  sections: InfoSection[];
}

export const SettingsInfoScreen = ({
  className,
  title,
  subtitle,
  updatedLabel,
  sections,
}: SettingsInfoScreenProps) => {
  return (
    <StableSafeAreaView className={cn("flex flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
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
      />
      <StableScrollView>
        <View className="flex flex-col gap-4 p-4 pb-10">
          <Card className="border-primary/10 bg-primary/5">
            <CardContent className="flex flex-col gap-2 px-4">
              <View className="flex flex-row items-center justify-between">
                <Text variant="h4">{title}</Text>
                {updatedLabel ? (
                  <Badge variant="outline">
                    <Text className="text-xs font-medium">{updatedLabel}</Text>
                  </Badge>
                ) : null}
              </View>
              <Text variant="muted">{subtitle}</Text>
            </CardContent>
          </Card>

          {sections.map((section, index) => (
            <Card key={`${section.title}-${index}`}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                {section.description ? (
                  <CardDescription>{section.description}</CardDescription>
                ) : null}
              </CardHeader>
              {section.bullets?.length ? (
                <CardContent className="flex flex-col gap-3">
                  {section.bullets.map((bullet, bulletIndex) => (
                    <View
                      key={`${section.title}-bullet-${bulletIndex}`}
                      className="flex flex-row gap-3"
                    >
                      <View className="mt-2 h-2 w-2 rounded-full bg-primary" />
                      <Text className="flex-1 text-sm text-foreground">
                        {bullet}
                      </Text>
                    </View>
                  ))}
                </CardContent>
              ) : null}
            </Card>
          ))}
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
