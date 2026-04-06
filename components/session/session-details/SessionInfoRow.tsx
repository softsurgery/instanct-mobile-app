import { View } from "react-native";
import { Text } from "../../ui/text";
import { Separator } from "../../ui/separator";

export const InfoRow = ({
  label,
  value,
  hideSeparator = false,
}: {
  label: string;
  value: string;
  hideSeparator?: boolean;
}) => (
  <View className="flex-col gap-2 py-2">
    <View className="flex-row items-center justify-between">
      <Text className="text-muted-foreground">{label}</Text>
      <Text className="font-medium text-right flex-1 ml-4">{value}</Text>
    </View>
    {!hideSeparator && <Separator />}
  </View>
);
