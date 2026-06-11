import { format } from "date-fns";
import { Play } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Image } from "@/components/ui/image";
import { Text } from "~/components/ui/text";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import { api } from "~/api";
import { MessageVariant, ResponseMessageDto } from "@/types";
import { PhotoPreview } from "~/components/shared/PhotoPreview";

interface ChatMediaBubbleProps {
  message: ResponseMessageDto;
  right?: boolean;
}

export const ChatMediaBubble = ({ message, right }: ChatMediaBubbleProps) => {
  const upload = message.uploads?.[0]?.upload;
  const uploadId = message.uploads?.[0]?.uploadId ?? upload?.id;

  const { data: mediaSource, isPending } = useQuery({
    queryKey: ["chat-media", uploadId],
    queryFn: () => api.upload.getUploadById(uploadId as number),
    enabled: typeof uploadId === "number",
  });

  const isVideo = message.variant === MessageVariant.VIDEO;
  const timestamp = format(new Date(message.createdAt), "hh:mm a");

  const bubble = (
    <View
      className={cn(
        "max-w-[75%] mx-3 mt-1.5 overflow-hidden rounded-xl",
        right ? "self-end" : "self-start",
      )}
    >
      <View className="relative">
        {isPending ? (
          <View className="w-56 h-40 items-center justify-center">
            <ActivityIndicator size="small" />
          </View>
        ) : isVideo ? (
          <View className="w-56 h-40 items-center justify-center">
            <View className="w-14 h-14 rounded-full items-center justify-center">
              <Icon as={Play} size={28} color="white" />
            </View>
            <Text className="text-white/80 text-xs mt-2">Video</Text>
          </View>
        ) : (
          <Image
            source={mediaSource}
            style={{ width: 224, height: 160 }}
            contentFit="cover"
          />
        )}
      </View>

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

  if (!isVideo && mediaSource) {
    return <PhotoPreview source={mediaSource}>{bubble}</PhotoPreview>;
  }

  return <Pressable>{bubble}</Pressable>;
};
