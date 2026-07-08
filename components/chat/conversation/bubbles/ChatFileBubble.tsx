import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { formatFileSize, openUploadFile } from "@/lib/files";
import { MessageVariant, PendingFileUpload, ResponseMessageDto } from "@/types";
import { format } from "date-fns";
import { File as FileIcon } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { getMessageFileItems } from "../../upload-details/FileListItem";
import { MediaUploadProgress } from "../staging/MediaUploadProgress";

interface ChatFileBubbleProps {
  className?: string;
  message?: ResponseMessageDto;
  pending?: PendingFileUpload;
  right?: boolean;
}

export const ChatFileBubble = ({
  className,
  message,
  pending,
  right,
}: ChatFileBubbleProps) => {
  const [openingUploadId, setOpeningUploadId] = React.useState<number | null>(
    null,
  );

  const fileItems = message ? getMessageFileItems(message) : [];
  const filename = pending?.filename ?? fileItems[0]?.upload.filename ?? "File";
  const fileSize = fileItems[0]?.upload.size;
  const timestamp = pending ? pending.createdAt : new Date(message!.createdAt);
  const isUploading = pending?.status === "uploading";
  const isSending = pending?.status === "sending";
  const uploadFailed = pending?.status === "failed";

  const handleOpen = React.useCallback(
    async (uploadId: number, name: string) => {
      if (openingUploadId !== null) return;

      setOpeningUploadId(uploadId);
      try {
        await openUploadFile(uploadId, name);
      } finally {
        setOpeningUploadId(null);
      }
    },
    [openingUploadId],
  );

  return (
    <View
      className={cn(
        "mx-3 mt-1.5 max-w-[80%] rounded-2xl border border-border bg-card overflow-hidden",
        right ? "self-end rounded-br-sm" : "self-start rounded-bl-sm",
        className,
      )}
      style={{ opacity: isSending ? 0.5 : 1 }}
    >
      {pending ? (
        <View className="flex-row items-center gap-3 px-3 py-3">
          <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
            <Icon as={FileIcon} size={18} className="text-primary" />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-sm font-medium" numberOfLines={1}>
              {filename}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {isUploading
                ? "Uploading..."
                : isSending
                  ? "Sending..."
                  : uploadFailed
                    ? "Upload failed"
                    : "File"}
            </Text>
          </View>
          {(isUploading || uploadFailed) && (
            <MediaUploadProgress
              progress={pending.progress}
              failed={uploadFailed}
            />
          )}
        </View>
      ) : (
        fileItems.map(({ uploadId, upload }) => (
          <Pressable
            key={uploadId}
            onPress={() => handleOpen(uploadId, upload.filename)}
            disabled={openingUploadId === uploadId}
            className="flex-row items-center gap-3 px-3 py-3 active:bg-muted/40"
          >
            <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
              {openingUploadId === uploadId ? (
                <ActivityIndicator size="small" />
              ) : (
                <Icon as={FileIcon} size={18} className="text-primary" />
              )}
            </View>
            <View className="flex-1 min-w-0">
              <Text className="text-sm font-medium" numberOfLines={2}>
                {upload.filename}
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {formatFileSize(upload.size)}
              </Text>
            </View>
          </Pressable>
        ))
      )}

      {!!(message?.content || pending?.content) && (
        <View className="px-3 pb-2">
          <Text className="text-[15px] leading-5 text-secondary-foreground">
            {message?.content ?? pending?.content}
          </Text>
        </View>
      )}

      <View className="px-3 pb-2">
        <Text
          className={cn(
            "text-xs text-muted-foreground",
            right ? "text-right" : "text-left",
          )}
        >
          {format(timestamp, "hh:mm a")}
        </Text>
      </View>
    </View>
  );
};
