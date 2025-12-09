import { EditScreen } from "@/components/EditScreen";
import { useLocalSearchParams } from "expo-router";

export default function Screen() {
  const { id } = useLocalSearchParams();
  return <EditScreen id={id as string} />;
}
