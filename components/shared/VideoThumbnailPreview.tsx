import { useVideoPlayer, VideoView } from "expo-video";

interface VideoThumbnailPreviewProps {
  source: any;
}

export const VideoThumbnailPreview = ({
  source,
}: VideoThumbnailPreviewProps) => {
  const player = useVideoPlayer(source, (player) => {
    player.muted = true;
    player.pause();
  });

  return (
    <VideoView
      style={{ width: "100%", height: "100%", position: "absolute", zIndex: 0 }}
      player={player}
      nativeControls={false}
      contentFit="cover"
    />
  );
};
