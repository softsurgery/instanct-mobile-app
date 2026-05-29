import { Request } from "@/components/request/Request";
import { useLocalSearchParams } from "expo-router";

export default function Screen() {
  const { id } = useLocalSearchParams();
  return <Request id={id as string} />;
}
