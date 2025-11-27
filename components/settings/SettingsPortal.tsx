import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert, View } from "react-native";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "../ui/button";
import { Text } from "../ui/text";

interface SettingsPortalProps {
  className?: string;
}

export const SettingsPortal = ({ className }: SettingsPortalProps) => {
  const authPersistStore = useAuthPersistStore();
  const queryClient = useQueryClient();
  const mapStore = useMapStore();
  const logout = () => {
    authPersistStore.logout?.();
    mapStore.reset();
    queryClient.clear();
    router.replace("/");
  };
  return (
    <View className={cn("flex flex-col gap-4 flex-1 p-4", className)}>
      <View>
        <Text variant={"lead"}>Accounts Settings</Text>
        <View className="flex flex-col gap-2"></View>
        <Text variant={"lead"}>Discovery</Text>
        <View className="flex flex-col gap-2"></View>
        <Text variant={"lead"}>Preferences</Text>
        <View className="flex flex-col gap-2">
          <ThemeToggle className="my-4" />
        </View>
        <Text variant={"lead"}>Global</Text>
        <View className="flex flex-col gap-2"></View>
        <Text variant={"lead"}>Legal</Text>
        <View className="flex flex-col gap-2"></View>
      </View>
      <View className="flex flex-col gap-2">
        <Button variant={"outline"} onPress={logout}>
          <Text>Logout</Text>
        </Button>
        <Button variant={"destructive"} onPress={() => {
          Alert.alert('Coming Soon!')
        }}>
          <Text>Delete Account</Text>
        </Button>
      </View>
    </View>
  );
};
