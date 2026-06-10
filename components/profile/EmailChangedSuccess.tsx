import { Success } from "@/components/shared/Success";
import { View } from "react-native";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

export const EmailChangedSuccess = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["current-user"] });
  }, []);
  return (
    <View className="flex-1 items-center justify-center gap-4">
      <Success
        message="Your email has been verified successfully"
        size={300}
        className="flex flex-col justify-center items-center"
        textProps={{
          className: "text-center text-lg font-bold",
        }}
      />
      <Button onPress={() => router.replace("/main/(tabs)")}>
        <Text className="text-white text-center">Go back to explore menu</Text>
      </Button>
    </View>
  );
};
