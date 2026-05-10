import { View } from "react-native";
import { cn } from "~/lib/utils";
import { Text } from "../../ui/text";
import { StablePressable } from "~/components/shared/StablePressable";
import { router, useNavigation } from "expo-router";
import { NavigationProps } from "~/types/app.routes";
import { ArrowLeft } from "lucide-react-native";
import { Icon } from "~/components/ui/icon";

interface ChatHeaderLeftProps {
  className?: string;
  id: string;
  identifier?: string;
  profilePicture?: React.ReactNode;
  lastSeen?: string;
}

export const ChatHeaderLeft = ({
  className,
  id,
  identifier,
  profilePicture,
  lastSeen,
}: ChatHeaderLeftProps) => {
  const navigation = useNavigation<NavigationProps>();
  return (
    <View className={cn("flex flex-row items-center flex-1 gap-1", className)}>
      <StablePressable
        className="p-2 rounded-full"
        onPress={() => navigation.goBack()}
        onPressClassname="bg-muted"
      >
        <Icon as={ArrowLeft} size={24} />
      </StablePressable>

      <StablePressable
        className="flex flex-row items-center gap-3 flex-1 py-1 px-1 rounded-lg"
        onPress={() =>
          router.push({
            pathname: "/main/profile/inspect-profile",
            params: { id },
          })
        }
        onPressClassname="bg-muted/50"
      >
        <View>{profilePicture}</View>
        <View className="flex flex-col justify-center">
          <Text className="font-semibold text-[15px]" numberOfLines={1}>
            {identifier}
          </Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {lastSeen}
          </Text>
        </View>
      </StablePressable>
    </View>
  );
};
