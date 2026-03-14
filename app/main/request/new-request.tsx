import { NewRequest } from "@/components/request/NewRequest";
import { useLocalSearchParams } from "expo-router";

export default function Screen() {
  const { id } = useLocalSearchParams();
  return <NewRequest id={id as string} />;
}
