import React from "react";
import Modal from "react-native-modal";
import { Image, type ImageProps } from "expo-image";
import { useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { StablePressable } from "@/components/shared/StablePressable";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface ProfilePhotoPreviewProps {
  source?: ImageProps["source"] | null;
  className?: string;
  children: React.ReactNode;
}

const MAX_SCALE = 3;

export const ProfilePhotoPreview = ({
  source,
  className,
  children,
}: ProfilePhotoPreviewProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const [isVisible, setIsVisible] = React.useState(false);

  const hasImageSource = React.useMemo(() => {
    if (!source) return false;

    if (Array.isArray(source)) return source.length > 0;
    if (typeof source === "string") return source.trim().length > 0;
    if (typeof source === "number") return true;

    return (
      typeof source === "object" &&
      "uri" in source &&
      typeof (source as { uri?: unknown }).uri === "string" &&
      (source as { uri: string }).uri.trim().length > 0
    );
  }, [source]);

  const avatarSize = React.useMemo(
    () => Math.min(Math.round(screenWidth * 0.78), 340),
    [screenWidth],
  );

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startTranslateX = useSharedValue(0);
  const startTranslateY = useSharedValue(0);

  const resetTransform = React.useCallback(() => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  }, [scale, translateX, translateY]);

  React.useEffect(() => {
    if (!isVisible) {
      resetTransform();
    }
  }, [isVisible, resetTransform]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      const nextScale = Math.min(
        MAX_SCALE,
        Math.max(1, startScale.value * event.scale),
      );
      scale.value = nextScale;
    })
    .onEnd(() => {
      if (scale.value <= 1.02) {
        runOnJS(resetTransform)();
      }
    });

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startTranslateX.value = translateX.value;
      startTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value <= 1.02) {
        return;
      }

      translateX.value = startTranslateX.value + event.translationX;
      translateY.value = startTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      if (scale.value <= 1.02) {
        runOnJS(resetTransform)();
      }
    });

  const gesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const openPreview = () => {
    if (!hasImageSource) return;
    setIsVisible(true);
  };

  const closePreview = () => {
    setIsVisible(false);
  };

  const trigger = hasImageSource ? (
    <StablePressable
      className={cn("overflow-hidden rounded-full", className)}
      onPress={openPreview}
      onPressClassname="opacity-90"
    >
      {children}
    </StablePressable>
  ) : (
    <View className={cn(className)}>{children}</View>
  );

  return (
    <>
      {trigger}

      <Modal
        isVisible={isVisible}
        onBackButtonPress={closePreview}
        backdropOpacity={0}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={180}
        animationOutTiming={160}
        style={{ margin: 0 }}
        useNativeDriver
        hideModalContentWhileAnimating
      >
        <View className="flex-1 bg-black">
          {hasImageSource ? (
            <Image
              source={source}
              contentFit="cover"
              blurRadius={40}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ) : null}

          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            className="bg-black/60"
          />

          <StablePressable
            className="absolute inset-0"
            onPress={closePreview}
            onPressClassname="opacity-100"
          />

          <View className="absolute top-0 left-0 right-0 z-10 flex-row justify-end p-6">
            <StablePressable
              onPress={closePreview}
              className="rounded-full bg-white/10 px-4 py-2"
              onPressClassname="bg-white/20"
            >
              <Text className="text-sm font-semibold text-white">Close</Text>
            </StablePressable>
          </View>

          {hasImageSource ? (
            <View className="flex-1 items-center justify-center">
              <GestureDetector gesture={gesture}>
                <View
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                    overflow: "hidden",
                  }}
                >
                  <Animated.View
                    style={[{ width: "100%", height: "100%" }, animatedStyle]}
                  >
                    <Image
                      source={source}
                      contentFit="cover"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </Animated.View>
                </View>
              </GestureDetector>
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
};
