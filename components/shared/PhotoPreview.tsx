import React from "react";
import type { ImageProps } from "expo-image";
import { View, type ImageURISource } from "react-native";
import ImageView from "react-native-image-viewing";

import { StablePressable } from "@/components/shared/StablePressable";
import { cn } from "@/lib/utils";

interface PhotoPreviewProps {
  className?: string;
  children: React.ReactNode;
  source?: ImageProps["source"] | null;
  index?: number;

  footer?: (helpers: {
    close: () => void;
    open: () => void;
  }) => React.ReactNode;
}

export const PhotoPreview = ({
  className,
  children,
  source,
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

  const trigger = hasImageSource ? (
    <StablePressable
      className={cn("overflow-hidden", className)}
      onPress={openPreview}
    >
      {children}
    </StablePressable>
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
