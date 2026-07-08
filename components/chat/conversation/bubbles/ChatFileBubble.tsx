import { Text } from "@/components/ui/text";
import { FileTypeIcon } from "@/components/shared/FileTypeIcon";
import { useServerUploads } from "@/hooks/content/useServerUploads";
import { cn } from "@/lib/utils";
import { openUploadFile } from "@/lib/files";
import { PendingFileUpload, ResponseMessageDto } from "@/types";
import { format } from "date-fns";
import React from "react";
import { Dimensions, View } from "react-native";
import {
  getMessageUploadEntries,
  resolveUploadDisplayName,
} from "../../upload-details/FileListItem";
import { ChatFileList, ChatFileListItem } from "./ChatFileList";
import { MessageTextContent } from "./MessageTextContent";

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
  const screenWidth = Dimensions.get("window").width;
  const CHAT_FILE_WIDTH = Math.round(screenWidth * 0.75);

  const [openingUploadId, setOpeningUploadId] = React.useState<number | null>(
    null,
  );

  const uploadEntries = message ? getMessageUploadEntries(message) : [];
  const uploadIds = uploadEntries.map((entry) => entry.uploadId);
  const { uploads } = useServerUploads(uploadIds);

  const pendingItems = pending?.items ?? [];

  const timestamp = pending ? pending.createdAt : new Date(message!.createdAt);
  const isUploading = pending?.status === "uploading";
  const isSending = pending?.status === "sending";
  const uploadFailed = pending?.status === "failed";

  const resolvedItems = React.useMemo<ChatFileListItem[]>(() => {
    if (pending) {
      return pendingItems.map((item) => ({
        filename: item.filename,
        mimetype: item.mimetype,
        size: item.fileSize,
      }));
    }

    return uploadEntries.map((entry, index) => {
      const fetchedUpload = uploads[index];
      const inlineUpload = entry.upload ?? fetchedUpload;

      return {
        uploadId: entry.uploadId,
        filename: resolveUploadDisplayName(
          inlineUpload,
          fetchedUpload,
          `File ${index + 1}`,
        ),
        mimetype: inlineUpload?.mimetype ?? fetchedUpload?.mimetype,
        size: inlineUpload?.size ?? fetchedUpload?.size,
      };
    });
  }, [pending, pendingItems, uploadEntries, uploads]);

  const handleOpen = React.useCallback(
    async (uploadId: number, filename: string) => {
      if (openingUploadId !== null) return;

      setOpeningUploadId(uploadId);
      try {
        await openUploadFile(uploadId, filename);
      } finally {
        setOpeningUploadId(null);
      }
    },
    [openingUploadId],
  );

  return (
    <View
      className={cn(
        "mx-3 mt-1.5",
        right ? "self-end" : "self-start",
        className,
      )}
      style={{
        maxWidth: CHAT_FILE_WIDTH + 24,
        opacity: isSending ? 0.5 : 1,
      }}
    >
      <ChatFileList
        items={resolvedItems}
        width={CHAT_FILE_WIDTH}
        openingUploadId={openingUploadId}
        onOpen={pending ? undefined : handleOpen}
        isUploading={isUploading}
        isSending={isSending}
        uploadFailed={uploadFailed}
        progress={pending?.progress}
      />

      {!!(message?.content || pending?.content) && (
        <View className="px-1 py-2">
          <MessageTextContent
            content={message?.content ?? pending?.content}
            links={message?.links}
            className="text-[15px] leading-5 text-secondary-foreground"
            linkClassName="text-primary font-medium"
          />
        </View>
      )}

      <View className="px-1 pt-1">
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
