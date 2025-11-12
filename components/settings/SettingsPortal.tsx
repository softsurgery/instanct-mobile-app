import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { View } from "react-native";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "../ui/button";
import { Text } from "../ui/text";

interface SettingsPortalProps {
  className?: string;
}

export const SettingsPortal = ({ className }: SettingsPortalProps) => {
  const authPersistStore = useAuthPersistStore();
  const queryClient = useQueryClient();
  const logout = () => {
    authPersistStore.logout?.();
    queryClient.clear();
    router.replace("/");
  };
  return (
    <View className={cn("flex-1 p-4", className)}>
      <Text variant={"lead"}>Accounts Settings</Text>
      <Text variant={"lead"}>Discovery</Text>
      <Text variant={"lead"}>Global</Text>
      <Text variant={"lead"}>Legal</Text>
      <ThemeToggle className="my-4" />
      <Button variant={"destructive"} onPress={logout}>
        <Text>Logout</Text>
      </Button>
      <Button variant={"ghost"}>
        <Text>Delete Account</Text>
      </Button>
    </View>
  );
};
