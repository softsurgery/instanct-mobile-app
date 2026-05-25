import React from "react";
import type { ImageProps } from "expo-image";
import { TouchableOpacity, View, type ImageURISource } from "react-native";
import ImageView from "react-native-image-viewing";
import { cn } from "@/lib/utils";

interface PhotoPreviewProps {
  className?: string;
  children: React.ReactNode;
  source?: ImageProps["source"] | null;
  index?: number;
  color?: string;
  presentationStyle?: "fullScreen" | "overFullScreen" | "pageSheet";
  onPress?: () => void;
  footer?: (helpers: {
    close: () => void;
    open: () => void;
  }) => React.ReactNode;
}

export const PhotoPreview = ({
  className,
  children,
  source,
  color = "rgba(0, 0, 0, 0.8)",
  presentationStyle = "overFullScreen",
  onPress,
  footer,
  index = 0,
}: PhotoPreviewProps) => {
  type ViewerImage = ImageURISource | number;

  const images = React.useMemo<ViewerImage[]>(() => {
    const normalize = (value: unknown): ViewerImage | null => {
      if (typeof value === "number") return value;

      if (typeof value === "string") {
        const uri = value.trim();

        if (!uri) return null;

        return { uri };
      }

      if (typeof value === "object" && value !== null && "uri" in value) {
        const uri = (value as { uri?: unknown }).uri;

        if (typeof uri !== "string" || uri.trim().length === 0) {
          return null;
        }

        return { uri: uri.trim() };
      }

      return null;
    };

    if (!source) return [];

    if (Array.isArray(source)) {
      return source
        .map(normalize)
        .filter((img): img is ViewerImage => img !== null);
    }

    const single = normalize(source);

    return single ? [single] : [];
  }, [source]);

  const hasImageSource = images.length > 0;

  const [isVisible, setIsVisible] = React.useState(false);

  const openPreview = React.useCallback(() => {
    if (!hasImageSource) return;

    setIsVisible(true);
  }, [hasImageSource]);

  const closePreview = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  const canPress = hasImageSource || !!onPress;

  const handlePress = () => {
    if (hasImageSource) {
      openPreview();
    } else {
      onPress?.();
    }
  };

  const trigger = canPress ? (
    <TouchableOpacity
      className={cn("z-10", className)}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  ) : (
    <View className={cn(className)}>{children}</View>
  );

  return (
    <>
      {trigger}

      {hasImageSource ? (
        <ImageView
          images={images}
          imageIndex={index}
          visible={isVisible}
          onRequestClose={closePreview}
          backgroundColor={color}
          presentationStyle={presentationStyle}
          FooterComponent={() => (
            <>
              {footer?.({
                close: closePreview,
                open: openPreview,
              })}
            </>
          )}
        />
      ) : null}
    </>
  );
};
