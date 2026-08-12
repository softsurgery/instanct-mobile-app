import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { toast } from "sonner-native";

export default function Screen() {
  const params = useLocalSearchParams();

  const deepLink = Linking.createURL("main/test/deep-link-test", {
    queryParams: { message: "hello" },
  });

  const copyLink = async () => {
    await Clipboard.setStringAsync(deepLink);
    toast.success("Link copied to clipboard");
  };

  return (
    <View className="flex-1 items-center justify-center gap-4 p-4">
      <Text className="text-xl font-bold">Deep Link Test Page</Text>

      <View className="w-full rounded-lg p-4">
        <Text className="mb-2 font-semibold">Incoming Parameters:</Text>
        <Text>{JSON.stringify(params, null, 2)}</Text>
      </View>

      <View className="w-full rounded-lg p-4">
        <Text className="mb-2 font-semibold">Your dynamic deep link:</Text>

        <Text className="text-sm text-blue-800">{deepLink}</Text>

        <Button onPress={copyLink}>
          <Text>Copy</Text>
        </Button>
      </View>
    </View>
  );
}
