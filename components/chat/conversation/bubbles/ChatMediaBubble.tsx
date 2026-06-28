import { format } from "date-fns";
import { Play } from "lucide-react-native";
import { Dimensions, View } from "react-native";
import { Image } from "expo-image";
import { Text } from "~/components/ui/text";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import {
  MessageVariant,
  ResponseMessageDto,
  PendingMediaUpload,
} from "@/types";
import { PhotoPreview } from "~/components/shared/PhotoPreview";
import { VideoPreview } from "~/components/shared/VideoPreview";
import { VideoThumbnailPreview } from "~/components/shared/VideoThumbnailPreview";
import { useServerImages } from "~/hooks/content/useServerImages";
import { MediaUploadProgress } from "../staging/MediaUploadProgress";

interface ChatMediaBubbleProps {
  className?: string;
  message?: ResponseMessageDto;
  pending?: PendingMediaUpload;
  right?: boolean;
}

export const ChatMediaBubble = ({
  className,
  message,
  pending,
  right,
}: ChatMediaBubbleProps) => {
  const screenWidth = Dimensions.get("window").width;

  const CHAT_MEDIA_WIDTH = Math.round(screenWidth * 0.75);
  const CHAT_MEDIA_HEIGHT = Math.round(CHAT_MEDIA_WIDTH * 0.75);

  const mediaFrameStyle = {
    width: CHAT_MEDIA_WIDTH,
    height: CHAT_MEDIA_HEIGHT,
  };

  const upload = message?.uploads?.[0]?.upload;
  const uploadId = message?.uploads?.[0]?.uploadId ?? upload?.id;

  const { uploads } = useServerImages({
    ids: [uploadId as number],
  });

  const mediaSource = uploads[0];
  console.log(mediaSource);

  const isVideo =
    pending?.variant === MessageVariant.VIDEO ||
    message?.variant === MessageVariant.VIDEO;

  const timestamp = pending ? pending.createdAt : new Date(message!.createdAt);
  const isUploading = pending?.status === "uploading";
  const uploadFailed = pending?.status === "failed";

  const mediaContent = pending ? (
    <View
      className="relative overflow-hidden rounded-xl bg-muted"
      style={mediaFrameStyle}
    >
      {pending.kind === "image" ? (
        <Image
          source={{ uri: pending.uri }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      ) : (
        <View className="w-full h-full items-center justify-center">
          <Image
            source={{ uri: pending.uri }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
            }}
            contentFit="cover"
          />
          <View className="w-10 h-10 rounded-full items-center justify-center bg-black/50 z-10">
            <Icon as={Play} size={14} color="white" fill="white" />
          </View>
        </View>
      )}
      {(isUploading || uploadFailed) && (
        <MediaUploadProgress
          progress={pending.progress}
          failed={uploadFailed}
        />
      )}
    </View>
  ) : (
    <Image
      className="rounded-xl"
      style={mediaFrameStyle}
      source={mediaSource}
      contentFit="cover"
    />
  );

  const bubble = (
    <View
      className={cn(
        "mx-3 mt-1.5",
        right ? "self-end" : "self-start",
        className,
      )}
      style={{ maxWidth: CHAT_MEDIA_WIDTH + 24 }}
    >
      <View>{mediaContent}</View>

      {!!(message?.content || pending?.content) && (
        <View className="px-3 py-2">
          <Text
            className={cn(
              "text-[15px] leading-5",
              right ? "text-primary-foreground" : "text-secondary-foreground",
            )}
          >
            {message?.content ?? pending?.content}
          </Text>
        </View>
      )}

      <View className="px-1 pt-1">
        <Text
          className={cn(
            "text-xs",
            right
              ? "text-muted-foreground text-right"
              : "text-muted-foreground/80 text-left",
          )}
        >
          {format(timestamp, "hh:mm a")}
        </Text>
      </View>
    </View>
  );

  if (pending || !message) {
    return bubble;
  }

  if (isVideo && mediaSource) {
    return (
      <VideoPreview
        className={cn(right ? "ml-auto" : "mr-auto")}
        source={mediaSource}
      >
        {bubble}
      </VideoPreview>
    );
  }

  if (!isVideo && mediaSource) {
    return (
      <PhotoPreview
        className={cn(right ? "ml-auto" : "mr-auto")}
        source={mediaSource}
      >
        {bubble}
      </PhotoPreview>
    );
  }

  return bubble;
};
