import React from "react";
import type { ImageSource } from "expo-image";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { Pause, Play, X } from "lucide-react-native";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StatusBar,
  View,
  type ImageURISource,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "~/components/ui/icon";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

export type AppVideoSource = {
  uri: string;
  headers?: Record<string, string>;
};

export type VideoSourceInput = ImageSource | ImageURISource | AppVideoSource;

export const toVideoSource = (
  source: VideoSourceInput | undefined | null,
): AppVideoSource | null => {
  if (!source) return null;

  if (typeof source === "number") return null;

  if (typeof source === "string") {
    const uri = (source as string).trim();
    return uri ? { uri } : null;
  }

  if ("uri" in source && typeof source.uri === "string") {
    const uri = source.uri.trim();
    if (!uri) return null;

    const headers =
      "headers" in source &&
      source.headers &&
      typeof source.headers === "object"
        ? (source.headers as Record<string, string>)
        : undefined;

    return { uri, headers };
  }

  return null;
};

const toVideoSources = (
  sources: VideoSourceInput[] | undefined,
  fallback?: VideoSourceInput | null,
): AppVideoSource[] => {
  if (sources?.length) {
    return sources
      .map((item) => toVideoSource(item))
      .filter((item): item is AppVideoSource => !!item);
  }

  const single = toVideoSource(fallback);
  return single ? [single] : [];
};

interface VideoPreviewProps {
  className?: string;
  children: React.ReactNode;
  source?: VideoSourceInput | null;
  sources?: VideoSourceInput[];
  index?: number;
}

interface VideoPlayerPageProps {
  source: AppVideoSource;
  isActive: boolean;
  width: number;
}

const formatVideoTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const paddedSeconds = secs.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
};

const VideoPlayerPage = ({ source, isActive, width }: VideoPlayerPageProps) => {
  const insets = useSafeAreaInsets();

  const player = useVideoPlayer(
    { uri: source.uri, headers: source.headers },
    (nextPlayer) => {
      nextPlayer.loop = false;
      nextPlayer.timeUpdateEventInterval = 0.25;
    },
  );

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });
  useEvent(player, "statusChange", { status: player.status });
  const { currentTime } = useEvent(player, "timeUpdate", {
    currentTime: player.currentTime,
    currentLiveTimestamp: player.currentLiveTimestamp,
    currentOffsetFromLive: player.currentOffsetFromLive,
    bufferedPosition: player.bufferedPosition,
  });

  React.useEffect(() => {
    if (isActive) {
      player.play();
      return;
    }

    player.pause();
  }, [isActive, player]);

  const togglePlayback = React.useCallback(() => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  return (
    <View style={{ width, flex: 1 }} className="bg-black">
      <VideoView
        style={{ flex: 1 }}
        player={player}
        nativeControls={false}
        contentFit="contain"
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
      />
      <View
        className="absolute left-0 right-0 flex-row items-center gap-4 px-4 py-3 bg-black/60"
        style={{ bottom: insets.bottom + 8 }}
      >
        <Pressable
          onPress={togglePlayback}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? "Pause video" : "Play video"}
          className="w-10 h-10 items-center justify-center"
        >
          <Icon
            as={isPlaying ? Pause : Play}
            size={22}
            color="white"
            fill={isPlaying ? undefined : "white"}
          />
        </Pressable>
        <Text className="text-sm font-medium text-white">
          {formatVideoTime(currentTime)} / {formatVideoTime(player.duration)}
        </Text>
      </View>
    </View>
  );
};

interface VideoPlayerModalProps {
  source: AppVideoSource;
  onClose: () => void;
}

const VideoPlayerModal = ({ source, onClose }: VideoPlayerModalProps) => {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;

  return (
    <Modal
      visible
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <StatusBar barStyle="light-content" />
      <View className="flex-1 bg-black">
        <VideoPlayerPage source={source} isActive width={screenWidth} />
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close video"
          className="absolute w-10 h-10 rounded-full bg-black/50 items-center justify-center"
          style={{ top: insets.top + 8, right: 16 }}
        >
          <Icon as={X} size={22} color="white" />
        </Pressable>
      </View>
    </Modal>
  );
};

interface VideoGalleryModalProps {
  sources: AppVideoSource[];
  initialIndex: number;
  onClose: () => void;
}

const VideoGalleryModal = ({
  sources,
  initialIndex,
  onClose,
}: VideoGalleryModalProps) => {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const listRef = React.useRef<FlatList<AppVideoSource>>(null);
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (index >= 0 && index < sources.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (index >= 0 && index < sources.length) {
      setActiveIndex(index);
    }
  };

  return (
    <Modal
      visible
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <StatusBar barStyle="light-content" />
      <View className="flex-1 bg-black">
        <FlatList
          ref={listRef}
          data={sources}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollToIndexFailed={(info) => {
            listRef.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: false,
            });
          }}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          keyExtractor={(_, index) => `video-${index}`}
          renderItem={({ item, index }) => (
            <VideoPlayerPage
              source={item}
              isActive={index === activeIndex}
              width={screenWidth}
            />
          )}
        />
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close video"
          className="absolute w-10 h-10 rounded-full bg-black/50 items-center justify-center"
          style={{ top: insets.top + 8, right: 16 }}
        >
          <Icon as={X} size={22} color="white" />
        </Pressable>
        {sources.length > 1 ? (
          <View
            className="absolute self-center bg-black/55 px-3 py-1 rounded-full"
            style={{ top: insets.top + 12 }}
          >
            <Text className="text-sm font-medium text-white">
              {activeIndex + 1} / {sources.length}
            </Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
};

export const VideoPreview = ({
  className,
  children,
  source,
  sources,
  index = 0,
}: VideoPreviewProps) => {
  const [visible, setVisible] = React.useState(false);
  const [openIndex, setOpenIndex] = React.useState(index);

  const videoSources = React.useMemo(
    () => toVideoSources(sources, source),
    [source, sources],
  );

  const canPress = videoSources.length > 0;

  const openPreview = React.useCallback(() => {
    if (!videoSources.length) return;

    const nextIndex = sources?.length
      ? Math.min(Math.max(index, 0), videoSources.length - 1)
      : 0;

    setOpenIndex(nextIndex);
    setVisible(true);
  }, [index, sources?.length, videoSources.length]);

  const closePreview = React.useCallback(() => {
    setVisible(false);
  }, []);

  const trigger = canPress ? (
    <Pressable
      className={cn("active:opacity-80", className)}
      onPress={openPreview}
      accessibilityRole="button"
      accessibilityLabel="Play video"
    >
      {children}
    </Pressable>
  ) : (
    <View className={cn(className)}>{children}</View>
  );

  return (
    <>
      {trigger}
      {visible && videoSources.length === 1 ? (
        <VideoPlayerModal source={videoSources[0]} onClose={closePreview} />
      ) : null}
      {visible && videoSources.length > 1 ? (
        <VideoGalleryModal
          sources={videoSources}
          initialIndex={openIndex}
          onClose={closePreview}
        />
      ) : null}
    </>
  );
};
