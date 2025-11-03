import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

export default function Screen() {
  const authPersistStore = useAuthPersistStore();
  const queryClient = useQueryClient();

  const signout = () => {
    authPersistStore.logout();
    queryClient.clear();
    router.replace("/");
  };
  return (
    <StableSafeAreaView className="flex-1 px-2">
      <Text>Tabs</Text>
      <Button onPress={signout}>
        <Text>Disconnect</Text>
      </Button>
    </StableSafeAreaView>
  );
}
