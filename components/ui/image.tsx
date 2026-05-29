import { Image as ExpoImage } from "expo-image";
import { cssInterop } from "nativewind";

cssInterop(ExpoImage, {
  className: {
    target: "style",
  },
});

export const Image = ExpoImage;
