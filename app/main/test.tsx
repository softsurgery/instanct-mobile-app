import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import React from "react";
import { View } from "react-native";
import { toast } from "sonner-native";

export default function Screen() {
  const showToast = () => {
    toast.warning("Hello, World!", {});
  };
  return (
    <View className="flex-1">
      <Button onPress={showToast}>
        <Text>Click me</Text>
      </Button>
    </View>
  );
}
