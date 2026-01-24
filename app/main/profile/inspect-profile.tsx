import { InspectProfile } from "@/components/profile/InspectProfile";
import { useLocalSearchParams } from "expo-router/build/hooks";

export default function Screen() {
  const { id } = useLocalSearchParams();
  return <InspectProfile id={id as string} />;
}
