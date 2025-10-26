import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useNavigation } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function Page() {
  const navigation = useNavigation<any>();
  return (
    <View className={cn("flex flex-col flex-1 items-center justify-center")}>
      <Button
        onPress={() => {
          navigation.navigate("auth/sign-in");
        }}
      >
        <Text>Get Started</Text>
      </Button>
    </View>
  );
}
