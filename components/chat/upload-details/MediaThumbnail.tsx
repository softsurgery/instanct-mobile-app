import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { MessageVariant, ResponseMessageDto } from "@/types";
import { ImageSource } from "expo-image";
import { Play } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { api } from "~/api";
import { VideoPreview } from "~/components/shared/VideoPreview";
import { VideoThumbnailPreview } from "~/components/shared/VideoThumbnailPreview";

/**
 * Extracts all server upload IDs from a message's attachments sorted by order.
 */
export const getMessageUploadIds = (message: ResponseMessageDto) =>
  [...(message.uploads ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((upload) => upload.uploadId ?? upload.upload?.id)
    .filter((id): id is number => typeof id === "number");

/**
 * Retrieves the primary (first) upload ID attached to a message.
 */
export const getMessageUploadId = (message: ResponseMessageDto) =>
  getMessageUploadIds(message)[0];

/**
 * Memoized square thumbnail cell rendering an image or video preview inside the media gallery grid.
 */
export const MediaThumbnail = React.memo(function MediaThumbnail({
  message,
  size,
  uploadId,
  mediaSource: mediaSourceOverride,
  onPress,
}: {
  message: ResponseMessageDto;
  size: number;
  uploadId?: number;
  mediaSource?: ImageSource;
  onPress?: () => void;
}) {
  const isVideo = message.variant === MessageVariant.VIDEO;
  const accessToken = useAuthPersistStore((state) => state.accessToken);

  const mediaSource = React.useMemo(() => {
    if (mediaSourceOverride) return mediaSourceOverride;
    if (typeof uploadId === "number" && accessToken) {
      return api.upload.getUploadById(uploadId);
    }
    return undefined;
  }, [accessToken, mediaSourceOverride, uploadId]);

  const content = (
    <View
      className="border border-border"
      style={{ width: size, height: size, padding: 1 }}
    >
      {isVideo ? (
        <View className="flex-1 bg-muted items-center justify-center relative">
          <View className="w-10 h-10 rounded-full items-center justify-center bg-black/50 absolute z-10">
            <Icon as={Play} size={16} color="white" fill="white" />
          </View>
          {mediaSource ? <VideoThumbnailPreview source={mediaSource} /> : null}
        </View>
      ) : mediaSource ? (
        <Image
          className="w-full h-full"
          source={mediaSource}
          recyclingKey={
            typeof uploadId === "number" ? `upload-${uploadId}` : undefined
          }
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View className="flex-1 bg-muted items-center justify-center">
          <Text className="text-muted-foreground text-xs">No Media</Text>
        </View>
      )}
    </View>
  );

  if (isVideo && mediaSource) {
    return <VideoPreview source={mediaSource}>{content}</VideoPreview>;
  }

  if (!isVideo && mediaSource && onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return content;
});
