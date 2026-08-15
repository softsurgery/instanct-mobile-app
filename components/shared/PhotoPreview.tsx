import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Modal,
  Pressable,
  View,
  useWindowDimensions,
  FlatList,
  StyleSheet,
} from "react-native";
import { Image, ImageSource } from "expo-image";
import { cn } from "@/lib/utils";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  SharedValue,
} from "react-native-reanimated";

export interface PhotoPreviewRef {
  open: () => void;
  close: () => void;
}

interface PhotoPreviewProps {
  className?: string;
  children?: React.ReactNode;
  source?: ImageSource;
  sources?: ImageSource[];
  index?: number;
  color?: string;
  presentationStyle?:
    | "fullScreen"
    | "overFullScreen"
    | "pageSheet"
    | "formSheet";
  onPress?: () => void;
  footer?: (helpers: {
    close: () => void;
    open: () => void;
  }) => React.ReactNode;
}

const DISMISS_THRESHOLD = 100;
const ANIMATION_DURATION = 180;
const ANIMATION_EASING = Easing.out(Easing.quad);

interface GestureImageProps {
  source: ImageSource;
  onDismiss: () => void;
  isSingleImage: boolean;
  onZoomStateChange: (isZoomed: boolean) => void;
  backdropOpacity: SharedValue<number>;
  triggerRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  isClosing: boolean;
}

function GestureImage({
  source,
  onDismiss,
  isSingleImage,
  onZoomStateChange,
  backdropOpacity,
  triggerRect,
  isClosing,
}: GestureImageProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const targetTranslateX = triggerRect
    ? triggerRect.x + triggerRect.width / 2 - screenWidth / 2
    : 0;
  const targetTranslateY = triggerRect
    ? triggerRect.y + triggerRect.height / 2 - screenHeight / 2
    : 0;
  const targetScale = triggerRect ? triggerRect.width / screenWidth : 1;

  const scale = useSharedValue(triggerRect ? targetScale : 1);
  const savedScale = useSharedValue(triggerRect ? targetScale : 1);
  const translateX = useSharedValue(triggerRect ? targetTranslateX : 0);
  const translateY = useSharedValue(triggerRect ? targetTranslateY : screenHeight);
  const savedTranslateX = useSharedValue(triggerRect ? targetTranslateX : 0);
  const savedTranslateY = useSharedValue(triggerRect ? targetTranslateY : screenHeight);

  // Trigger open animation on mount
  useEffect(() => {
    translateX.value = withTiming(0, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
    translateY.value = withTiming(0, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
    scale.value = withTiming(1, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
    backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
  }, [triggerRect, translateX, translateY, scale, backdropOpacity]);

  const dismiss = useCallback(() => {
    if (triggerRect) {
      translateX.value = withTiming(targetTranslateX, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
      translateY.value = withTiming(targetTranslateY, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
      scale.value = withTiming(targetScale, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
      backdropOpacity.value = withTiming(0, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING }, (finished) => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      });
    } else {
      translateY.value = withTiming(screenHeight, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
      backdropOpacity.value = withTiming(0, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING }, (finished) => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      });
    }
  }, [
    triggerRect,
    targetTranslateX,
    targetTranslateY,
    targetScale,
    screenHeight,
    onDismiss,
    translateX,
    translateY,
    scale,
    backdropOpacity,
  ]);

  // Trigger close animation when parent requests it
  useEffect(() => {
    if (isClosing) {
      dismiss();
    }
  }, [isClosing, dismiss]);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
        savedScale.value = 1;
        translateX.value = withTiming(0, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
        translateY.value = withTiming(0, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(onZoomStateChange)(false);
      } else if (scale.value > 4) {
        scale.value = withTiming(4, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
        savedScale.value = 4;
      } else {
        savedScale.value = scale.value;
        if (scale.value > 1.05) {
          runOnJS(onZoomStateChange)(true);
        } else {
          runOnJS(onZoomStateChange)(false);
        }
      }
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value > 1) {
        // Zoomed: pan inside image bounds
        const maxTranslateX = (scale.value - 1) * (screenWidth / 2);
        const maxTranslateY = (scale.value - 1) * (screenHeight / 2);

        translateX.value = Math.min(
          Math.max(savedTranslateX.value + event.translationX, -maxTranslateX),
          maxTranslateX
        );
        translateY.value = Math.min(
          Math.max(savedTranslateY.value + event.translationY, -maxTranslateY),
          maxTranslateY
        );
      } else {
        // Single image: drag in any direction
        // Multiple images: drag vertically only (X is locked to 0)
        if (isSingleImage) {
          translateX.value = event.translationX;
          translateY.value = event.translationY;
        } else {
          translateY.value = event.translationY;
        }

        const dx = isSingleImage ? translateX.value : 0;
        const dy = translateY.value;
        const dist = Math.sqrt(dx * dx + dy * dy);
        backdropOpacity.value = Math.max(0, 1 - dist / 300);
      }
    })
    .onEnd(() => {
      if (scale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      } else {
        const dx = isSingleImage ? translateX.value : 0;
        const dy = translateY.value;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > DISMISS_THRESHOLD) {
          runOnJS(dismiss)();
        } else {
          translateX.value = withTiming(0, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
          translateY.value = withTiming(0, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
          backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
        }
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
        savedScale.value = 1;
        translateX.value = withTiming(0, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
        translateY.value = withTiming(0, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(onZoomStateChange)(false);
      } else {
        scale.value = withTiming(2.5, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING });
        savedScale.value = 2.5;
        runOnJS(onZoomStateChange)(true);
      }
    });

  const gesture = Gesture.Simultaneous(
    Gesture.Race(pinchGesture, doubleTapGesture),
    panGesture
  );

  const animatedStyle = useAnimatedStyle(() => {
    const dx = isSingleImage ? translateX.value : 0;
    const dy = translateY.value;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Scale down image slightly as it gets dragged further from center (min scale 0.85)
    const dragScale = scale.value === 1 ? Math.max(0.85, 1 - dist / 1000) : scale.value;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: dragScale },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          {
            width: screenWidth,
            height: screenHeight,
            justifyContent: "center",
            alignItems: "center",
          },
          animatedStyle,
        ]}
      >
        <Image
          source={source}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}

export const PhotoPreview = forwardRef<PhotoPreviewRef, PhotoPreviewProps>(
  (
    {
      className,
      children,
      source,
      sources,
      index = 0,
      color = "rgba(0,0,0,0.85)",
      presentationStyle = "overFullScreen",
      onPress,
      footer,
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const backdropOpacity = useSharedValue(0);
    const [triggerRect, setTriggerRect] = useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

    const containerRef = useRef<View>(null);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const images = sources?.length ? sources : source ? [source] : [];
    const initialIndex = images.length
      ? Math.min(Math.max(index, 0), images.length - 1)
      : 0;

    const open = () => {
      onPress?.();
      if (!images.length) return;
      setIsClosing(false);
      backdropOpacity.value = 0;
      setIsZoomed(false);

      // Measure the Pressable container to get screen coordinates for shared element transition
      containerRef.current?.measureInWindow((x, y, width, height) => {
        if (width && height && width > 0 && height > 0) {
          setTriggerRect({ x, y, width, height });
        } else {
          setTriggerRect(null);
        }
        setVisible(true);
      });
    };

    const close = () => {
      setIsClosing(true);
    };

    const handleDismiss = () => {
      setVisible(false);
      setIsClosing(false);
    };

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    const animatedBackdropStyle = useAnimatedStyle(() => {
      return {
        opacity: backdropOpacity.value,
      };
    });

    return (
      <View ref={containerRef} className={className}>
        {children && (
          <Pressable className={cn("active:opacity-80", className)} onPress={open}>
            {children}
          </Pressable>
        )}

        <Modal
          transparent
          visible={visible}
          presentationStyle={presentationStyle}
          onRequestClose={close}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: "transparent" }}>
              {/* Backdrop */}
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: color },
                  animatedBackdropStyle,
                ]}
              />

              {/* Close Button */}
              <Pressable
                onPress={close}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                style={{
                  position: "absolute",
                  top: insets.top + 10,
                  right: 20,
                  zIndex: 1000,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <X size={20} color="white" />
              </Pressable>

              {/* Image Content */}
              {images.length === 1 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <GestureImage
                    source={images[0]}
                    onDismiss={handleDismiss}
                    isSingleImage={true}
                    onZoomStateChange={setIsZoomed}
                    backdropOpacity={backdropOpacity}
                    triggerRect={triggerRect}
                    isClosing={isClosing}
                  />
                </View>
              ) : (
                <FlatList
                  data={images}
                  horizontal
                  pagingEnabled
                  scrollEnabled={!isZoomed}
                  initialScrollIndex={initialIndex}
                  getItemLayout={(_, idx) => ({
                    length: screenWidth,
                    offset: screenWidth * idx,
                    index: idx,
                  })}
                  onScrollToIndexFailed={() => {}}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(_, idx) => idx.toString()}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        width: screenWidth,
                        height: screenHeight,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <GestureImage
                        source={item}
                        onDismiss={handleDismiss}
                        isSingleImage={false}
                        onZoomStateChange={setIsZoomed}
                        backdropOpacity={backdropOpacity}
                        triggerRect={triggerRect}
                        isClosing={isClosing}
                      />
                    </View>
                  )}
                />
              )}

              {/* Footer */}
              {footer && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                  }}
                >
                  {footer({ close, open })}
                </View>
              )}
            </View>
          </GestureHandlerRootView>
        </Modal>
      </View>
    );
  },
);

PhotoPreview.displayName = "PhotoPreview";
