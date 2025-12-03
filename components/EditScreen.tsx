import { View } from "react-native";
import { Text } from "./ui/text";

interface EditScreenProps {
  className?: string;
}

export const EditScreen = ({ className }: EditScreenProps) => {
  return (
    <View className={className}>
      <Text>EditProfile</Text>
    </View>
  );
};
