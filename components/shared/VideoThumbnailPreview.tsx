import { Image } from "@/components/ui/image";
import {
  requestVideoThumbnail,
  getDiskCachedThumbnailUri,
  getThumbnailCacheKey,
  promoteDiskCacheToMemory,
  getMemoryCachedThumbnail,
} from "@/lib/video";
import type { ImageSource } from "expo-image";
import React from "react";
import { View } from "react-native";

import { toVideoSource, type VideoSourceInput } from "./VideoPreview";

interface VideoThumbnailPreviewProps {
  source?: VideoSourceInput | null;
}

export const VideoThumbnailPreview = ({
  source,
}: VideoThumbnailPreviewProps) => {
  const videoSource = React.useMemo(() => toVideoSource(source), [source]);
  const cacheKey = videoSource ? getThumbnailCacheKey(videoSource) : "";
  const [state, setState] = React.useState<{
    cacheKey: string;
    thumbnail?: ImageSource;
    hasFailed: boolean;
  }>({ cacheKey: "", hasFailed: false });

  const activeThumbnail =
    state.cacheKey === cacheKey
      ? state.thumbnail
      : cacheKey
        ? getMemoryCachedThumbnail(cacheKey)
        : undefined;
  const activeHasFailed = state.cacheKey === cacheKey ? state.hasFailed : false;

  React.useEffect(() => {
    if (!videoSource || !cacheKey) {
      return;
    }

    let cancelled = false;

    requestVideoThumbnail(videoSource).then((result) => {
      if (cancelled) return;

      if (result) {
        setState({ cacheKey, thumbnail: result, hasFailed: false });
        return;
      }

      setState({ cacheKey, thumbnail: undefined, hasFailed: true });
    });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, videoSource]);

  const handleImageLoad = React.useCallback(async () => {
    if (!cacheKey) return;

    const diskUri = await getDiskCachedThumbnailUri(cacheKey);
    if (diskUri) {
      promoteDiskCacheToMemory(cacheKey, diskUri);
    }
  }, [cacheKey]);

  if (!activeThumbnail || activeHasFailed) {
    return (
      <View
        className="bg-muted"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: 0,
        }}
      />
    );
  }

  return (
    <Image
      source={activeThumbnail}
      onLoad={handleImageLoad}
      onError={() =>
        setState((prev) =>
          prev.cacheKey === cacheKey ? { ...prev, hasFailed: true } : prev,
        )
      }
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        zIndex: 0,
      }}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
  );
};
