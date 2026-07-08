import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { cacheDirectory, downloadAsync } from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert, Linking, Platform } from "react-native";
import { ResponseMessageUploadFileDto } from "@/types";
import { Upload } from "@/types/upload";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const UUID_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.[a-z0-9]+)?$/i;

type UploadNameSource =
  | Partial<
      Pick<ResponseMessageUploadFileDto, "filename" | "slug" | "mimetype">
    >
  | Partial<Pick<Upload, "filename" | "slug" | "mimetype">>
  | null
  | undefined;

export const isSlugLikeFilename = (value?: string | null) => {
  if (!value) return true;

  const trimmed = value.trim();
  if (!trimmed) return true;

  if (UUID_FILENAME_PATTERN.test(trimmed)) {
    return true;
  }

  const baseName = trimmed.split("/").pop()?.split(".")[0] ?? trimmed;
  return /^[0-9a-f-]{36}$/i.test(baseName);
};

export const getUploadDisplayName = (
  upload: UploadNameSource,
  fallback = "File",
) => {
  const filename = upload?.filename?.trim();
  if (filename && !isSlugLikeFilename(filename)) {
    return filename;
  }

  return fallback;
};

export const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes <= 0) return "Unknown size";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
};

export const getUploadDownloadUrl = (uploadId: number) =>
  `${BASE_URL}/storage/download/id/${uploadId}`;

export const openUploadFile = async (
  uploadId: number,
  filename: string,
): Promise<void> => {
  const accessToken = useAuthPersistStore.getState().accessToken;
  const downloadUrl = getUploadDownloadUrl(uploadId);

  if (Platform.OS === "web") {
    if (accessToken) {
      window.open(downloadUrl, "_blank");
    }
    return;
  }

  if (!accessToken) {
    Alert.alert("Unable to open file", "You need to be signed in.");
    return;
  }

  try {
    const safeFilename = filename.replace(/[^\w.-]+/g, "_") || "file";
    const localUri = `${cacheDirectory}${uploadId}-${safeFilename}`;

    const result = await downloadAsync(downloadUrl, localUri, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri);
      return;
    }

    await Linking.openURL(result.uri);
  } catch (error) {
    console.error("Failed to open file:", error);
    Alert.alert("Unable to open file", "Please try again in a moment.");
  }
};
