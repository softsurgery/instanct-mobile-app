import { RequestStatus } from "@/types";
import { View } from "react-native";
import { Icon } from "../ui/icon";
import { CheckCircle2, XCircle } from "lucide-react-native";
import { Text } from "../ui/text";

interface RequestStatusBadgeProps {
  status?: RequestStatus;
}

export const StatusBadge = ({ status }: RequestStatusBadgeProps) => {
  if (status === RequestStatus.Accepted) {
    return (
      <View className="flex-row items-center gap-1.5 px-3.5 py-1.5">
        <Icon as={CheckCircle2} size={18} className="text-emerald-600" />
        <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          Acceptée
        </Text>
      </View>
    );
  }

  if (status === RequestStatus.Rejected) {
    return (
      <View className="flex-row items-center gap-1.5 px-3.5 py-1.5">
        <Icon as={XCircle} size={18} className="text-red-600" />
        <Text className="text-xs font-semibold text-red-700 dark:text-red-400">
          Refusée
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-2 px-3.5 py-1.5">
      <View className="h-2 w-2 rounded-full bg-amber-500" />
      <Text className="text-xs font-semibold text-amber-700 dark:text-amber-400">
        En attente
      </Text>
    </View>
  );
};
