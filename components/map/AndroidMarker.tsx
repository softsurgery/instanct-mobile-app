import React from "react";
import { Platform, View } from "react-native";
import ViewShot, { ViewShotRef } from "react-native-view-shot";

interface MarkerCaptureLayerProps {
  items: {
    id: string;
    content: React.ReactNode;
  }[];
  onCapture: (id: string, uri: string) => void;
}

/**
 * Renders marker views offscreen and captures them as images via ViewShot.
 * Used on Android to bypass the canvas bitmap rendering bug in react-native-maps
 * where Marker children are clipped or not rendered properly.
 *
 * Must be rendered OUTSIDE of MapView (as a sibling).
 */
export const MarkerCaptureLayer = ({
  items,
  onCapture,
}: MarkerCaptureLayerProps) => {
  if (Platform.OS !== "android") return null;

  return (
    <View
      style={{ position: "absolute", left: -9999, top: -9999, opacity: 0 }}
      pointerEvents="none"
      collapsable={false}
    >
      {items.map((item) => (
        <MarkerCaptureItem key={item.id} id={item.id} onCapture={onCapture}>
          {item.content}
        </MarkerCaptureItem>
      ))}
    </View>
  );
};

interface MarkerCaptureItemProps {
  id: string;
  children: React.ReactNode;
  onCapture: (id: string, uri: string) => void;
}

const MarkerCaptureItem = ({
  id,
  children,
  onCapture,
}: MarkerCaptureItemProps) => {
  const viewShotRef = React.useRef<ViewShotRef>(null);
  const captureTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const capture = React.useCallback(() => {
    if (captureTimeout.current) clearTimeout(captureTimeout.current);
    captureTimeout.current = setTimeout(async () => {
      try {
        if (viewShotRef.current) {
          const uri = await (viewShotRef.current as any).capture();
          onCapture(id, uri);
        }
      } catch {
        // View may not be laid out yet, will retry
      }
    }, 150);
  }, [id, onCapture]);

  // Re-capture when children change (online status, loaded images, etc.)
  React.useEffect(() => {
    capture();
    // Second capture to catch async-loaded images (e.g. profile pictures)
    const delayedCapture = setTimeout(capture, 1200);
    return () => {
      if (captureTimeout.current) clearTimeout(captureTimeout.current);
      clearTimeout(delayedCapture);
    };
  }, [children, capture]);

  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: "png", result: "tmpfile" }}
      onLayout={capture}
    >
      {children}
    </ViewShot>
  );
};
