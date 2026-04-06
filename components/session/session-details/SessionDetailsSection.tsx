import { View } from "react-native";
import { Text } from "../../ui/text";
import { cn } from "@/lib/utils";

interface SessionDetailsSectionProps {
  className?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Section = ({
  className,
  title,
  description,
  children,
}: SessionDetailsSectionProps) => (
  <View
    className={cn(
      "border border-b-border border-t-border overflow-hidden",
      className,
    )}
  >
    <View className="px-8 py-4 bg-background/75 mb-4">
      <Text className="text-lg font-semibold">{title}</Text>
      <Text className="text-sm text-muted-foreground mt-1">{description}</Text>
    </View>
    <View className="px-4 pb-4 flex flex-col">{children}</View>
  </View>
);
