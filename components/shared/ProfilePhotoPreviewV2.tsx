import React from "react";
import { Image, type ImageProps } from "expo-image";
import Lightbox from "react-native-lightbox-v2";
import { StablePressable } from "@/components/shared/StablePressable";
import { cn } from "@/lib/utils";

interface ProfilePhotoPreviewV2Props {
  source?: ImageProps["source"] | null;
  className?: string;
  children: React.ReactNode;
}

export const ProfilePhotoPreviewV2 = ({
  source,
  className,
  children,
}: ProfilePhotoPreviewV2Props) => {
  return (
    <Lightbox
      underlayColor="transparent"
      backgroundColor="black"
      renderContent={() => (
        <Image
          source={source ?? undefined}
          contentFit="scale-down"
          style={{ width: "100%", height: "100%" }}
        />
      )}
      renderItem={(open) => (
        <StablePressable
          className={cn("overflow-hidden rounded-full", className)}
          onPress={open}
          onPressClassname="opacity-90"
        >
          {children}
        </StablePressable>
      )}
    />
  );
};
