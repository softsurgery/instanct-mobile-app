import { Text } from "@/components/ui/text";
import { FileTypeIcon } from "@/components/shared/FileTypeIcon";
import { useServerUploads } from "@/hooks/content/useServerUploads";
import {
  formatFileSize,
  getUploadDisplayName,
  isSlugLikeFilename,
  openUploadFile,
} from "@/lib/files";
import { ResponseMessageDto, ResponseMessageUploadFileDto } from "@/types";
import { Upload } from "@/types/upload";
import { format } from "date-fns";
import React from "react";
import { Pressable, View } from "react-native";

interface FileListItemProps {
  message: ResponseMessageDto;
  uploadId: number;
  upload?: ResponseMessageUploadFileDto;
  displayName?: string;
  size?: number;
}

export const resolveUploadDisplayName = (
  inlineUpload?: ResponseMessageUploadFileDto | Upload,
  fetchedUpload?: Upload,
  fallback = "File",
) => {
  const inlineName = getUploadDisplayName(inlineUpload, "");
  if (inlineName) return inlineName;

  const fetchedName = getUploadDisplayName(fetchedUpload, "");
  if (fetchedName) return fetchedName;

  return fallback;
};

export const getMessageUploadEntries = (message: ResponseMessageDto) =>
  [...(message.uploads ?? [])]
    .sort((a, b) => a.order - b.order)
    .flatMap((entry) => {
      const uploadId = entry.uploadId ?? entry.upload?.id;

      if (typeof uploadId !== "number") {
        return [];
      }

      return [{ uploadId, upload: entry.upload }];
    });

export const FileListItem = React.memo(function FileListItem({
  message,
  uploadId,
  upload,
  displayName,
  size,
}: FileListItemProps) {
  const [isOpening, setIsOpening] = React.useState(false);
  const shouldFetch = !upload?.filename || isSlugLikeFilename(upload.filename);
  const { uploads } = useServerUploads([shouldFetch ? uploadId : undefined]);
  const fetchedUpload = uploads[0];
  const resolvedName =
    displayName ?? resolveUploadDisplayName(upload, fetchedUpload, "File");
  const resolvedSize = size ?? upload?.size ?? fetchedUpload?.size;
  const resolvedMimetype = upload?.mimetype ?? fetchedUpload?.mimetype;

  const handlePress = React.useCallback(async () => {
    if (isOpening) return;

    setIsOpening(true);
    try {
      await openUploadFile(uploadId, resolvedName);
    } finally {
      setIsOpening(false);
    }
  }, [isOpening, resolvedName, uploadId]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={isOpening}
      className="flex-row items-center gap-3 px-4 py-3 border-b border-border active:bg-muted/40"
      accessibilityRole="button"
    >
      <FileTypeIcon
        filename={resolvedName}
        mimetype={resolvedMimetype}
        size={44}
        iconSize={20}
        loading={isOpening}
      />

      <View className="flex-1 min-w-0">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {resolvedName}
        </Text>
        <Text
          className="text-xs text-muted-foreground mt-0.5"
          numberOfLines={1}
        >
          {formatFileSize(resolvedSize)} ·{" "}
          {format(new Date(message.createdAt), "MMM d, yyyy")}
        </Text>
      </View>
    </Pressable>
  );
});

/** @deprecated Use getMessageUploadEntries */
export const getMessageFileItems = (message: ResponseMessageDto) =>
  getMessageUploadEntries(message).flatMap(({ uploadId, upload }) =>
    upload ? [{ uploadId, upload }] : [],
  );
