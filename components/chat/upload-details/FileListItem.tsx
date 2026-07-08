import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatFileSize, openUploadFile } from "@/lib/files";
import {
  ResponseMessageDto,
  ResponseMessageUploadFileDto,
} from "@/types";
import { format } from "date-fns";
import { File as FileIcon } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

interface FileListItemProps {
  message: ResponseMessageDto;
  upload: ResponseMessageUploadFileDto;
  uploadId: number;
}

export const FileListItem = React.memo(function FileListItem({
  message,
  upload,
  uploadId,
}: FileListItemProps) {
  const [isOpening, setIsOpening] = React.useState(false);

  const handlePress = React.useCallback(async () => {
    if (isOpening) return;

    setIsOpening(true);
    try {
      await openUploadFile(uploadId, upload.filename);
    } finally {
      setIsOpening(false);
    }
  }, [isOpening, upload.filename, uploadId]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={isOpening}
      className="flex-row items-center gap-3 px-4 py-3 border-b border-border active:bg-muted/40"
      accessibilityRole="button"
    >
      <View className="w-11 h-11 rounded-xl bg-muted items-center justify-center">
        {isOpening ? (
          <ActivityIndicator size="small" />
        ) : (
          <Icon as={FileIcon} size={20} className="text-primary" />
        )}
      </View>

      <View className="flex-1 min-w-0">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {upload.filename}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
          {formatFileSize(upload.size)} · {format(new Date(message.createdAt), "MMM d, yyyy")}
        </Text>
      </View>
    </Pressable>
  );
});

export const getMessageFileItems = (message: ResponseMessageDto) =>
  [...(message.uploads ?? [])]
    .sort((a, b) => a.order - b.order)
    .flatMap((entry) => {
      const uploadId = entry.uploadId ?? entry.upload?.id;
      const upload = entry.upload;

      if (typeof uploadId !== "number" || !upload) {
        return [];
      }

      return [{ uploadId, upload }];
    });
