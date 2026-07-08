import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { cacheDirectory, downloadAsync } from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert, Linking, Platform } from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

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
