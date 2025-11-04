import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { View } from "react-native";

export default function Screen() {
  const authPersistStore = useAuthPersistStore();
  const queryClient = useQueryClient();

  const signout = () => {
    authPersistStore.logout();
    queryClient.clear();
    router.replace("/");
  };
  return (
    <View>
      <Text>Tabs</Text>
      <Button onPress={signout}>
        <Text>Disconnect</Text>
      </Button>
    </View>
  );
}
