// This module is a thumbnail generation and caching manager for videos in an Expo app. It solves a few problems:

// Avoid generating the same thumbnail multiple times.
// Cache thumbnails in memory and on disk.
// Generate only one thumbnail at a time because a single VideoPlayer instance is shared.
// Queue thumbnail requests until the player is available.

import { Image } from "expo-image";
import type { AppVideoSource } from "@/components/shared/VideoPreview";
import type { ImageSource } from "expo-image";
import type { VideoPlayer } from "expo-video";

// This stores thumbnails only while the app is running.
const memoryCache = new Map<string, ImageSource>();

export const getThumbnailCacheKey = (source: AppVideoSource): string => {
  const auth = source.headers?.Authorization ?? "";
  return `video-thumb:${source.uri}:${auth}`;
};

export const getMemoryCachedThumbnail = (
  cacheKey: string,
): ImageSource | undefined => memoryCache.get(cacheKey);

export const setMemoryCachedThumbnail = (
  cacheKey: string,
  thumbnail: ImageSource,
): void => {
  memoryCache.set(cacheKey, thumbnail);
};

export const getDiskCachedThumbnailUri = async (
  cacheKey: string,
): Promise<string | null> => {
  try {
    const path = await Image.getCachePathAsync(cacheKey);
    return path || null;
  } catch {
    return null;
  }
};

export const promoteDiskCacheToMemory = (
  cacheKey: string,
  uri: string,
): ImageSource => {
  const source = { uri };
  setMemoryCachedThumbnail(cacheKey, source);
  return source;
};

type ThumbnailJob = {
  cacheKey: string;
  source: AppVideoSource;
  resolve: (thumbnail: ImageSource | null) => void;
};

const queue: ThumbnailJob[] = [];
const inflight = new Map<string, Promise<ImageSource | null>>();

let player: VideoPlayer | null = null;
let currentJob: ThumbnailJob | null = null;
let isGenerating = false;

export const setThumbnailPlayer = (nextPlayer: VideoPlayer | null) => {
  player = nextPlayer;
  if (player && queue.length > 0) {
    void startNextJob();
  }
};

export const onThumbnailPlayerStatusChange = (status: string) => {
  if (currentJob && status === "error") {
    finishCurrentJob(null);
    return;
  }

  if (currentJob && status === "readyToPlay" && !isGenerating) {
    void generateForCurrentJob();
  }
};

export const requestVideoThumbnail = (
  source: AppVideoSource,
): Promise<ImageSource | null> => {
  const cacheKey = getThumbnailCacheKey(source);

  const existingInflight = inflight.get(cacheKey);
  if (existingInflight) return existingInflight;

  const memory = getMemoryCachedThumbnail(cacheKey);
  if (memory) return Promise.resolve(memory);

  const promise = (async () => {
    const diskUri = await getDiskCachedThumbnailUri(cacheKey);
    if (diskUri) {
      return promoteDiskCacheToMemory(cacheKey, diskUri);
    }

    return new Promise<ImageSource | null>((resolve) => {
      queue.push({ cacheKey, source, resolve });
      void startNextJob();
    });
  })();

  inflight.set(cacheKey, promise);
  promise.finally(() => {
    inflight.delete(cacheKey);
  });

  return promise;
};

const startNextJob = async () => {
  if (!player || currentJob || queue.length === 0) return;

  currentJob = queue.shift() ?? null;
  if (!currentJob) return;

  try {
    await player.replaceAsync({
      uri: currentJob.source.uri,
      headers: currentJob.source.headers,
    });

    if (player.status === "readyToPlay") {
      await generateForCurrentJob();
    }
  } catch {
    finishCurrentJob(null);
  }
};

const generateForCurrentJob = async () => {
  if (!player || !currentJob || isGenerating) return;

  isGenerating = true;

  try {
    const thumbnails = await player.generateThumbnailsAsync(0, {
      maxWidth: 512,
    });
    const thumbnail = thumbnails[0] ?? null;

    if (thumbnail) {
      setMemoryCachedThumbnail(currentJob.cacheKey, thumbnail);
    }

    finishCurrentJob(thumbnail);
  } catch {
    finishCurrentJob(null);
  } finally {
    isGenerating = false;
  }
};

const finishCurrentJob = (thumbnail: ImageSource | null) => {
  if (!currentJob) return;

  currentJob.resolve(thumbnail);
  currentJob = null;
  void startNextJob();
};
