import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { MessageVariant, ResponseMessageDto } from "@/types";
import { ImageSource } from "expo-image";
import { Play } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { api } from "~/api";
import { VideoPreview } from "~/components/shared/VideoPreview";
import { VideoThumbnailPreview } from "~/components/shared/VideoThumbnailPreview";

export const getMessageUploadId = (message: ResponseMessageDto) => {
  const upload = message.uploads?.[0]?.upload;
  return message.uploads?.[0]?.uploadId ?? upload?.id;
};

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

  const mediaSource = React.useMemo(() => {
    if (mediaSourceOverride) return mediaSourceOverride;
    if (typeof uploadId === "number")
      return api.upload.getUploadSource(uploadId);
    return undefined;
  }, [mediaSourceOverride, uploadId]);

  const content = (
    <View style={{ width: size, height: size, padding: 1 }}>
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
