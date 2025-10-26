import { cn } from "@/lib/utils";
import React, { forwardRef, ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-aware-scroll-view";

interface StableKeyboardAwareScrollViewProps
  extends Omit<
    KeyboardAwareScrollViewProps,
    "style" | "contentContainerStyle"
  > {
  className?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const StableKeyboardAwareScrollView = forwardRef<
  KeyboardAwareScrollView,
  StableKeyboardAwareScrollViewProps
>((props, ref) => {
  const { className, children, style, contentContainerStyle, ...rest } = props;

  return (
    <KeyboardAwareScrollView
      className={cn(className)}
      ref={ref}
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      bounces={false}
      style={style}
      contentContainerStyle={contentContainerStyle}
      enableOnAndroid={true}
      {...rest}
    >
      {children}
    </KeyboardAwareScrollView>
  );
});

StableKeyboardAwareScrollView.displayName = "StableKeyboardAwareScrollView";
