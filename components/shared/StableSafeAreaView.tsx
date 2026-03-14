import React from "react";
import { Platform, StatusBar, ViewProps } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { cn } from "~/lib/utils";

interface StableSafeAreaViewProps extends ViewProps {
  children: React.ReactNode;
}

export const StableSafeAreaView: React.FC<StableSafeAreaViewProps> = ({
  className,
  children,
  style,
  ...props
}) => {
  const insets = useSafeAreaInsets();

  const paddingTop =
    Platform.OS === "android"
      ? (StatusBar.currentHeight ?? 0) + insets.top
      : insets.top;

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={[{ flex: 1, paddingTop }, style]}
      className={cn(className)}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};
