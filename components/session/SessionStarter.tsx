import { cn } from "@/lib/utils";
import { View } from "react-native";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { Users, Telescope } from "lucide-react-native";
import { router } from "expo-router";

interface SessionStarterProps {
  className?: string;
}

export const SessionStarter = ({ className }: SessionStarterProps) => {
  return (
    <View
      className={cn("flex-1 items-center justify-center gap-6 px-6", className)}
    >
      {/* Illustration with connecting people */}
      <View className="relative w-[80vw] h-[20vh] items-center justify-center">
        {/* Background decorative element */}
        <View className="absolute inset-0 items-center justify-center opacity-10">
          <View className="w-full h-full border-4 border-primary rounded-full" />
        </View>

        {/* Center telescope icon */}
        <View className="z-10 bg-primary rounded-full p-3 mb-8">
          <Telescope size={48} color="white" strokeWidth={1} />
        </View>

        {/* Connected people circles */}
        <View className="absolute top-4 left-0 bg-blue-400 rounded-full p-2">
          <Users size={30} color="white" />
        </View>
        <View className="absolute top-6 right-4 bg-purple-400 rounded-full p-2">
          <Users size={30} color="white" />
        </View>
        <View className="absolute bottom-0 left-8 bg-pink-400 rounded-full p-2">
          <Users size={30} color="white" />
        </View>
        <View className="absolute bottom-0 right-12 bg-green-400 rounded-full p-2">
          <Users size={30} color="white" />
        </View>
      </View>

      <Text variant={"h1"} className="text-center">
        Prêt à connecter ?
      </Text>
      <Text className="text-center text-base px-2">
        Commencez votre première session !
      </Text>
      <View className="w-full mt-4">
        <Button
          variant={"default"}
          onPress={() => router.push("/main/explore/session-starter")}
          className="w-full"
        >
          <Text>Démarrer une session</Text>
        </Button>
      </View>
    </View>
  );
};
