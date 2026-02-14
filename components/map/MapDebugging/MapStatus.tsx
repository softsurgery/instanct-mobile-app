import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { View } from "react-native";
import { Text } from "../../ui/text";

interface MapStatusProps {
  className?: string;
}

export const MapStatus = ({ className }: MapStatusProps) => {
  const mapStore = useMapStore();
  return (
    <View>
      <Text className={cn("mx-4 bg-transparent text-xs font-bold", className)}>
        Status:
        <Text
          className={cn(
            "text-xs font-bold",
            mapStore.connected ? "text-green-500" : "text-red-500",
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
      <Text className="mx-4 bg-transparent text-xs font-bold">
        Coordinates:{" "}
        <Text className="text-xs">
          {mapStore.location?.coords.latitude.toFixed(3)},{" "}
          {mapStore.location?.coords.longitude.toFixed(3)}
        </Text>
      </Text>
      <Text className="mx-4 bg-transparent text-xs font-bold">
        Range: <Text className="text-xs">{mapStore.parameters.radius} KM</Text>
      </Text>
    </View>
  );
};
