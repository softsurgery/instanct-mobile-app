import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { DocumentFileType, getFileTypeStyle } from "@/lib/fileType";
import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, View, ViewStyle } from "react-native";

const FILE_TYPE_ICONS: Record<DocumentFileType, LucideIcon> = {
  pdf: FileText,
  word: FileText,
  excel: FileSpreadsheet,
  powerpoint: Presentation,
  text: FileText,
  image: FileImage,
  archive: FileArchive,
  audio: FileAudio,
  video: FileVideo,
  code: FileText,
  generic: File,
};

interface FileTypeIconProps {
  filename?: string | null;
  mimetype?: string | null;
  size?: number;
  iconSize?: number;
  className?: string;
  style?: ViewStyle;
  loading?: boolean;
}

export const FileTypeIcon = ({
  filename,
  mimetype,
  size = 40,
  iconSize,
  className,
  style,
  loading = false,
}: FileTypeIconProps) => {
  const fileStyle = getFileTypeStyle(filename, mimetype);
  const IconComponent = FILE_TYPE_ICONS[fileStyle.type];
  const resolvedIconSize = iconSize ?? Math.round(size * 0.45);

  return (
    <View
      className={cn("rounded-xl items-center justify-center", className)}
      style={[
        {
          width: size,
          height: size,
          backgroundColor: fileStyle.backgroundColor,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fileStyle.color} />
      ) : (
        <Icon
          as={IconComponent}
          size={resolvedIconSize}
          color={fileStyle.color}
        />
      )}
    </View>
  );
};
