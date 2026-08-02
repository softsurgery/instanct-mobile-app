import { Request } from "@/components/request/Request";
import { useLocalSearchParams } from "expo-router";

export default function Screen() {
  const { id, isIncoming, hasLocation } = useLocalSearchParams();
  return (
    <Request
      id={id as string}
      isIncoming={isIncoming === "1"}
      hasLocation={hasLocation === "1"}
    />
  );
}
