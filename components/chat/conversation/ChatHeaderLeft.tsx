import { Pressable, View } from "react-native";
import { cn } from "~/lib/utils";
import { Text } from "../../ui/text";
import { router, useNavigation } from "expo-router";
import { NavigationProps } from "~/types/app.routes";
import { ArrowLeft } from "lucide-react-native";
import { Icon } from "~/components/ui/icon";

interface ChatHeaderLeftProps {
  className?: string;
  id: string;
  identifier?: string;
  profilePicture?: React.ReactNode;
  isOnline?: boolean;
  lastSeen?: string;
}

export const ChatHeaderLeft = ({
  className,
  id,
  identifier,
  profilePicture,
  isOnline,
  lastSeen,
}: ChatHeaderLeftProps) => {
  const navigation = useNavigation<NavigationProps>();
  return (
    <View className={cn("flex flex-row items-center flex-1 gap-1", className)}>
      <Pressable
        className="p-2 rounded-full active:bg-muted"
        onPress={() => navigation.goBack()}
      >
        <Icon as={ArrowLeft} size={24} />
      </Pressable>

      <Pressable
        className="flex flex-row items-center gap-3 flex-1 py-1 px-1 rounded-lg active:bg-muted/50"
        onPress={() =>
          router.push({
            pathname: "/main/profile/inspect-profile",
            params: { id },
          })
        }
      >
        <View>
          {profilePicture}
          {isOnline && (
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
          )}
        </View>
        <View className="flex flex-col justify-center">
          <Text className="font-semibold text-[15px]" numberOfLines={1}>
            {identifier}
          </Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {lastSeen}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};
