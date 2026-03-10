import { DemmandePortal } from "@/components/settings/support/testing-screens/DemandePortal";
import { useLocalSearchParams } from "expo-router";

export default function Screen() {
  const { id } = useLocalSearchParams();
  return <DemmandePortal id={id as string} />;
}
