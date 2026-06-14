import { RequestStatus } from "@/types";
import { View } from "react-native";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { CheckCircle2, XCircle } from "lucide-react-native";

interface RequestStatusBadgeProps {
  status?: RequestStatus;
}

const STATUS_CONFIG = {
  [RequestStatus.Accepted]: {
    label: "Acceptée",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    textClass: "text-emerald-700 dark:text-emerald-400",
  },
  [RequestStatus.Rejected]: {
    label: "Refusée",
    icon: XCircle,
    iconClass: "text-red-600",
    textClass: "text-red-700 dark:text-red-400",
  },
  [RequestStatus.Sent]: {
    label: "En attente",
    dotClass: "bg-amber-500",
    textClass: "text-amber-700 dark:text-amber-400",
  },
  [RequestStatus.Expired]: {
    label: "Expirée",
    dotClass: "bg-gray-500",
    textClass: "text-gray-700 dark:text-gray-400",
  },
} as const;

export const StatusBadge = ({ status }: RequestStatusBadgeProps) => {
  if (!status) return null;

  const config = STATUS_CONFIG[status];

  if (!config) return null;

  return (
    <View className="flex-row items-center gap-2 px-3.5 py-1.5">
      {"icon" in config ? (
        <Icon as={config.icon} size={18} className={config.iconClass} />
      ) : (
        <View className={`h-2 w-2 rounded-full ${config.dotClass}`} />
      )}

      <Text className={`text-xs font-semibold ${config.textClass}`}>
        {config.label}
      </Text>
    </View>
  );
};