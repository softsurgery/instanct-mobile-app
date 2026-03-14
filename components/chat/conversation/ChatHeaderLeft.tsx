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
    <View
      className={cn(
        "flex flex-row items-center justify-center gap-2 py-2",
        className,
      )}
    >
      {/* backbuttin */}
      <StablePressable
        className="mx-4"
        onPress={() => {
          navigation.goBack();
        }}
      >
        <Icon as={ArrowLeft} size={28} />
      </StablePressable>
      <StablePressable
        className="flex flex-row gap-2"
        onPress={() =>
          router.push({
            pathname: "/main/profile/inspect-profile",
            params: { id },
          })
        }
      >
        <View>{profilePicture}</View>
        <View className="flex flex-col justify-center">
          <Text className="font-bold">{identifier}</Text>
          <Text className="text-xs">{lastSeen}</Text>
        </View>
      </StablePressable>
    </View>
  );
};
