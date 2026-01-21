import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { BlurView } from "expo-blur";
import { MapPinned } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "../ui/icon";
import { useColorScheme } from "nativewind";
import { cn } from "@/lib/utils";

interface MapSessionStarterProps {
  className?: string;
  onStart: () => void;
}

export const MapSessionStarter = ({
  className,
  onStart,
}: MapSessionStarterProps) => {
  const { colorScheme } = useColorScheme();
  return (
    <BlurView
      intensity={40}
      tint={colorScheme}
      className={cn("flex-1 absolute inset-0 z-50", className)}
    >
      <SafeAreaView className="flex-1 items-center justify-center p-6">
        <View className="bg-card/80 w-full max-w-sm items-center gap-6 rounded-3xl border border-border p-8 shadow-xl">
          <View className="bg-primary/20 h-20 w-20 items-center justify-center rounded-full">
            <Icon as={MapPinned} size={40} />
          </View>

          <View className="items-center gap-2">
            <Text className="text-center text-2xl font-bold">
              Explore Your World
            </Text>
            <Text className="text-muted-foreground text-center">
              Connect with people nearby, discover local events, and share your
              moments in real-time.
            </Text>
          </View>

          <Button size="lg" className="w-full rounded-2xl" onPress={onStart}>
            <Text className="font-bold">Start Exploring</Text>
          </Button>
        </View>
      </SafeAreaView>
    </BlurView>
  );
};
