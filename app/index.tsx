import { cn } from "@/lib/utils";
import { Text, View } from "react-native";

export default function Page() {
  const random = Math.random();
  return (
    <View
      className={cn(
        "bg-red-500",
        random > 0.5 ? "text-blue-500" : "bg-green-500"
      )}
    >
      <Text className="italic">Hello World</Text>
    </View>
  );
}
