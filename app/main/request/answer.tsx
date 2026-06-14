import { Request } from "@/components/request/Request";
import { useLocalSearchParams } from "expo-router";

export default function Screen() {
  const { id, isIncoming } = useLocalSearchParams();
  return <Request id={id as string} isIncoming={isIncoming === "1"} />;
}
