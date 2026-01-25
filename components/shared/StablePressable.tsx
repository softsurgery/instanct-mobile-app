import { cn } from "@/lib/utils";
import React from "react";
import { Pressable } from "react-native";

export interface StablePressableProps extends React.ComponentPropsWithoutRef<
  typeof Pressable
> {
  className?: string;
  onPressClassname?: string;
  children?: React.ReactNode;
  onPress?: () => void;
}

export const StablePressable = ({
  className,
  onPressClassname,
  onPress,
  children,
  ...props
}: StablePressableProps) => {
  const [pressed, setPressed] = React.useState(false);
  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      className={cn(
        className,
        pressed && (onPressClassname || "bg-secondary/25"),
      )}
      onPress={onPress}
      {...props}
    >
      {children}
    </Pressable>
  );
};
