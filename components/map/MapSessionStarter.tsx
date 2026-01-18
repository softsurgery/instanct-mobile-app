import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { BlurView } from "expo-blur";
import { MapPinned } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "../ui/icon";

interface MapSessionStarterProps {
  onStart: () => void;
}

export const MapSessionStarter = ({ onStart }: MapSessionStarterProps) => {
  return (
    <BlurView
      intensity={35}
      className="absolute inset-0 z-50 flex-1"
      style={StyleSheet.absoluteFill}
      tint="dark"
    >
      <SafeAreaView className="flex-1 items-center justify-center p-6">
        <View className="bg-card w-full max-w-sm items-center gap-6 rounded-3xl border border-border p-8 shadow-xl">
          <View className="bg-primary/10 h-20 w-20 items-center justify-center rounded-full">
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
