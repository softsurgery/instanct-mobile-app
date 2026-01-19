import { useLocalSearchParams } from "expo-router";
import { SceneScreen } from "~/components/shared/scene-builder/SceneScreen";

export default function Screen() {
  const { id } = useLocalSearchParams();
  return <SceneScreen id={id as string} />;
}
