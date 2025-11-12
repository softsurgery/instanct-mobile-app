import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { Text } from "../ui/text";

interface MapStatusProps {
  className?: string;
}

export const MapStatus = ({ className }: MapStatusProps) => {
  const mapStore = useMapStore();
  return (
    <Text className={cn("mx-2 bg-transparent text-xs font-bold", className)}>
      Status:
      <Text
        className={cn(
          "text-xs font-bold",
          mapStore.connected ? "text-green-500" : "text-red-500"
        )}
      >
        {" "}
        {mapStore.connected ? "Online" : "Offline"}
      </Text>{" "}
      {!mapStore.connected && (
        <Text
          className={cn("text-xs font-bold text-gray-200 dark:text-gray-400")}
        >
          / Reconnecting ({mapStore.reconnection.reconnectAttempt})
        </Text>
      )}
    </Text>
  );
};
