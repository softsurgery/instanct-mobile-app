import { format } from "date-fns";
import { Play } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import { Image } from "@/components/ui/image";
import { Text } from "~/components/ui/text";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import { MessageVariant, ResponseMessageDto } from "@/types";
import { PhotoPreview } from "~/components/shared/PhotoPreview";
import { VideoPreview } from "~/components/shared/VideoPreview";
import { useServerImages } from "~/hooks/content/useServerImages";

interface ChatMediaBubbleProps {
  message: ResponseMessageDto;
  right?: boolean;
}

export const ChatMediaBubble = ({ message, right }: ChatMediaBubbleProps) => {
  const upload = message.uploads?.[0]?.upload;
  const uploadId = message.uploads?.[0]?.uploadId ?? upload?.id;

  const { uploads, isPending } = useServerImages({
    ids: [uploadId as number | undefined],
  });
  const mediaSource = uploads[0];

  const isVideo = message.variant === MessageVariant.VIDEO;
  const timestamp = format(new Date(message.createdAt), "hh:mm a");

  const mediaContent = isPending ? (
    <View className="w-56 h-40 items-center justify-center">
      <ActivityIndicator size="small" />
    </View>
  ) : isVideo ? (
    <View className="relative w-56 h-40 bg-muted items-center justify-center overflow-hidden rounded-xl">
      {mediaSource ? (
        <Image
          className="absolute inset-0 w-full h-full"
          source={mediaSource}
          contentFit="cover"
        />
      ) : null}
      <View className="w-14 h-14 rounded-full items-center justify-center bg-black/50">
        <Icon as={Play} size={28} color="white" />
      </View>
    </View>
  ) : (
    <Image
      className="rounded-xl w-56 h-40"
      source={mediaSource}
      contentFit="cover"
    />
  );

  const bubble = (
    <View
      className={cn(
        "max-w-[75%] mx-3 mt-1.5 overflow-hidden",
        right ? "self-end" : "self-start",
      )}
    >
      <View className="relative">{mediaContent}</View>

      {!!message.content && (
        <View className="px-3 py-2">
          <Text
            className={cn(
              "text-[15px] leading-5",
              right ? "text-primary-foreground" : "text-secondary-foreground",
            )}
          >
            {message.content}
          </Text>
        </View>
      )}

      <View className="px-3 py-2">
        <Text
          className={cn(
            "text-xs",
            right
              ? "text-primary-foreground/70 text-right"
              : "text-secondary-foreground/60 text-left",
          )}
        >
          {timestamp}
        </Text>
      </View>
    </View>
  );

  if (isVideo && mediaSource) {
    return <VideoPreview source={mediaSource}>{bubble}</VideoPreview>;
  }

  if (!isVideo && mediaSource) {
    return <PhotoPreview source={mediaSource}>{bubble}</PhotoPreview>;
  }

  return bubble;
};
