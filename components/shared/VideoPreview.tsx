import React from "react";
import type { ImageSource } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { X } from "lucide-react-native";
import {
  Modal,
  Pressable,
  StatusBar,
  View,
  type ImageURISource,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";

export type AppVideoSource = {
  uri: string;
  headers?: Record<string, string>;
};

export const toVideoSource = (
  source: ImageSource | ImageURISource | AppVideoSource | undefined | null,
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

interface VideoPreviewProps {
  className?: string;
  children: React.ReactNode;
  source?: ImageSource | ImageURISource | AppVideoSource | null;
}

interface VideoPlayerModalProps {
  source: AppVideoSource;
  onClose: () => void;
}

const VideoPlayerModal = ({ source, onClose }: VideoPlayerModalProps) => {
  const insets = useSafeAreaInsets();

  const player = useVideoPlayer(
    { uri: source.uri, headers: source.headers },
    (nextPlayer) => {
      nextPlayer.loop = false;
      nextPlayer.play();
    },
  );

  return (
    <Modal
      visible
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <StatusBar barStyle="light-content" />
      <View className="flex-1 bg-black">
        <VideoView
          style={{ flex: 1 }}
          player={player}
          nativeControls
          contentFit="contain"
          fullscreenOptions={{ enable: true }}
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
      </View>
    </Modal>
  );
};

export const VideoPreview = ({
  className,
  children,
  source,
}: VideoPreviewProps) => {
  const [visible, setVisible] = React.useState(false);
  const videoSource = React.useMemo(() => toVideoSource(source), [source]);
  const canPress = !!videoSource;

  const openPreview = React.useCallback(() => {
    if (!videoSource) return;
    setVisible(true);
  }, [videoSource]);

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
      {visible && videoSource ? (
        <VideoPlayerModal source={videoSource} onClose={closePreview} />
      ) : null}
    </>
  );
};
