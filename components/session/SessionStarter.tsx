import { cn } from "@/lib/utils";
import { View } from "react-native";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { LocateOff } from "lucide-react-native";
import { router } from "expo-router";

interface SessionStarterProps {
  className?: string;
}

export const SessionStarter = ({ className }: SessionStarterProps) => {
  return (
    <View className={cn("flex-1 items-center justify-center gap-4", className)}>
      <Icon as={LocateOff} size={48} />
      <Text variant={"h1"}>No Sessions</Text>
      <Text className="text-center">
        You don&apos;t have any active sessions.
      </Text>
      <Text className="text-center">
        Start a new session to get discovered & connect with like-minded
        professionals in your industry.
      </Text>
      <View className="flex flex-row gap-2">
        <Button
          variant={"default"}
          onPress={() => router.push("/main/explore/session-starter")}
        >
          <Text>Start New Session</Text>
        </Button>
      </View>
    </View>
  );
};
