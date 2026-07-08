import { Text } from "@/components/ui/text";
import { FileTypeIcon } from "@/components/shared/FileTypeIcon";
import { formatFileSize } from "@/lib/files";
import React from "react";
import { Pressable, View } from "react-native";
import { MediaUploadProgress } from "../staging/MediaUploadProgress";

export type ChatFileListItem = {
  uploadId?: number;
  filename: string;
  mimetype?: string;
  size?: number;
};

interface ChatFileListProps {
  items: ChatFileListItem[];
  width: number;
  openingUploadId?: number | null;
  onOpen?: (uploadId: number, filename: string) => void;
  isUploading?: boolean;
  isSending?: boolean;
  uploadFailed?: boolean;
  progress?: number;
}

const ChatFileRow = ({
  item,
  isOpening,
  onPress,
  subtitle,
  showDivider,
}: {
  item: ChatFileListItem;
  isOpening: boolean;
  onPress?: () => void;
  subtitle: string;
  showDivider: boolean;
}) => {
  const content = (
    <View
      className={`flex-row items-center gap-3 px-3 py-3 ${showDivider ? "border-b border-border" : ""}`}
    >
      <FileTypeIcon
        filename={item.filename}
        mimetype={item.mimetype}
        size={40}
        iconSize={18}
        loading={isOpening}
      />
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-medium" numberOfLines={2}>
          {item.filename}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5">{subtitle}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} disabled={isOpening} className="active:bg-muted/40">
        {content}
      </Pressable>
    );
  }

  return content;
};

export const ChatFileList = ({
  items,
  width,
  openingUploadId,
  onOpen,
  isUploading,
  isSending,
  uploadFailed,
  progress,
}: ChatFileListProps) => {
  const showProgress = isUploading || uploadFailed;

  return (
    <View
      className="relative overflow-hidden rounded-xl border border-border bg-card"
      style={{ width }}
    >
      {items.map((item, index) => {
        const isOpening =
          typeof item.uploadId === "number" && openingUploadId === item.uploadId;

        let subtitle = formatFileSize(item.size);
        if (isUploading) subtitle = "Uploading...";
        else if (isSending) subtitle = "Sending...";
        else if (uploadFailed) subtitle = "Upload failed";

        return (
          <ChatFileRow
            key={`${item.uploadId ?? item.filename}-${index}`}
            item={item}
            isOpening={isOpening}
            subtitle={subtitle}
            showDivider={index < items.length - 1}
            onPress={
              typeof item.uploadId === "number" && onOpen
                ? () => onOpen(item.uploadId!, item.filename)
                : undefined
            }
          />
        );
      })}

      {showProgress ? (
        <MediaUploadProgress progress={progress ?? 0} failed={uploadFailed} />
      ) : null}
    </View>
  );
};
