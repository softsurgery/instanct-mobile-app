import { View } from "react-native";
import { cn } from "~/lib/utils";
import { Text } from "../../ui/text";
import { StablePressable } from "~/components/shared/StablePressable";
import { useNavigation } from "expo-router";
import { NavigationProps } from "~/types/app.routes";
import { ArrowLeft } from "lucide-react-native";
import { Icon } from "~/components/ui/icon";

interface ChatHeaderLeftProps {
  className?: string;
  identifier?: string;
  profilePicture?: React.ReactNode;
  lastSeen?: string;
}

export const ChatHeaderLeft = ({
  className,
  identifier,
  profilePicture,
  lastSeen,
}: ChatHeaderLeftProps) => {
  const navigation = useNavigation<NavigationProps>();
  return (
    <View
      className={cn(
        "flex flex-row items-center justify-center gap-2 my-2",
        className
      )}
    >
      {/* backbuttin */}
      <StablePressable
        className="ml-4 mr-2"
        onPress={() => {
          navigation.goBack();
        }}
      >
        <Icon as={ArrowLeft} size={20} strokeWidth={3} />
      </StablePressable>
      <View>{profilePicture}</View>
      <View className="flex flex-col justify-center">
        <Text>{identifier}</Text>
        <Text className="text-xs">{lastSeen}</Text>
      </View>
    </View>
  );
};
