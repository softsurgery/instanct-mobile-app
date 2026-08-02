import { cn } from "@/lib/utils";
import { Platform, View, ViewProps } from "react-native";

interface BottomButtonWrapperProps extends ViewProps {}

export const BottomButtonWrapper = ({ children }: BottomButtonWrapperProps) => {
  return (
    <View
      className={cn(
        "border-t border-border bg-card gap-4",
        Platform.OS === "ios" ? "p-4 pb-10" : "p-4",
      )}
    >
      <View className="flex flex-col justify-between gap-2 px-4">
        {children}
      </View>
    </View>
  );
};
