import { Platform } from "react-native";

/**
 * Calculates relative luminance from RGB components according to WCAG standard.
 * Returns a value between 0 (black) and 1 (white).
 */
export function calculateLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determines average image luminance from an image URL / URI.
 * On web platform, utilizes canvas to sample image pixels.
 * Returns relative luminance (0..1) or null if unable to extract.
 */
export async function getCoverLuminance(imageUri?: string): Promise<number | null> {
  if (!imageUri) return null;

  if (Platform.OS === "web" && typeof window !== "undefined" && typeof document !== "undefined") {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }

          // Sample down to small dimensions for fast luminance computation
          const sampleWidth = 32;
          const sampleHeight = 32;
          canvas.width = sampleWidth;
          canvas.height = sampleHeight;

          ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
          const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
          const data = imageData.data;

          let totalLuminance = 0;
          const totalPixels = data.length / 4;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            totalLuminance += calculateLuminance(r, g, b);
          }

          resolve(totalLuminance / totalPixels);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imageUri;
    });
  }

  return null;
}
