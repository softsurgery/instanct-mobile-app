import { ScrollViewContext } from "@/contexts/ScrollViewContext";
import { cn } from "@/lib/utils";
import React, { forwardRef, ReactNode, useCallback, useRef } from "react";
import { Dimensions, Keyboard, StyleProp, View, ViewStyle } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "@react-native-ohos/react-native-keyboard-aware-scroll-view";

interface StableKeyboardAwareScrollViewProps extends Omit<
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
  const {
    className,
    children,
    style,
    contentContainerStyle,
    showsHorizontalScrollIndicator = false,
    showsVerticalScrollIndicator = false,
    bounces = true,
    onScroll: onScrollProp,
    ...rest
  } = props;

  const innerRef = useRef<KeyboardAwareScrollView>(null);
  const scrollOffsetRef = useRef(0);

  const setRef = useCallback(
    (node: KeyboardAwareScrollView | null) => {
      innerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (
          ref as React.MutableRefObject<KeyboardAwareScrollView | null>
        ).current = node;
      }
    },
    [ref],
  );

  const handleScroll = useCallback(
    (e: any) => {
      scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
      onScrollProp?.(e);
    },
    [onScrollProp],
  );

  const scrollToView = useCallback((viewRef: React.RefObject<View | null>) => {
    if (!viewRef.current || !innerRef.current) return;
    viewRef.current.measureInWindow((_x, y, _width, height) => {
      const screenHeight = Dimensions.get("window").height;
      const bottomOfTarget = y + height;
      if (bottomOfTarget > screenHeight - 40) {
        const extra = bottomOfTarget - screenHeight + 150;
        innerRef.current?.scrollToPosition(
          0,
          scrollOffsetRef.current + extra,
          true,
        );
      }
    });
  }, []);

  const contextValue = React.useMemo(() => ({ scrollToView }), [scrollToView]);

  return (
    <ScrollViewContext.Provider value={contextValue}>
      <KeyboardAwareScrollView
        className={cn(className)}
        ref={setRef}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        bounces={bounces}
        style={style}
        contentContainerStyle={contentContainerStyle}
        enableOnAndroid={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        enableResetScrollToCoords={false}
        {...rest}
      >
        {children}
      </KeyboardAwareScrollView>
    </ScrollViewContext.Provider>
  );
});

StableKeyboardAwareScrollView.displayName = "StableKeyboardAwareScrollView";
