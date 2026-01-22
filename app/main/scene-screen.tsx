import { SceneScreen } from "@/components/SceneScreen";
import { useLocalSearchParams } from "expo-router";

export default function Screen() {
  const { id } = useLocalSearchParams();
  return <SceneScreen id={id as string} />;
}
