import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { Upload } from "~/types/upload";
import { File as ExpoFile, UploadType } from "expo-file-system";
import { Platform } from "react-native";
import axios from "./axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/**
 * File descriptor used by React Native FormData instead of a web `File`.
 * Image picker assets are cast to this shape before upload.
 */
export type ReactNativeUploadFile = {
  uri: string;
  name: string;
  type: string;
};

/** Accepted upload payload on web (File) and native ({ uri, name, type }). */
export type UploadFileInput = File | ReactNativeUploadFile;

/**
 * Returns true when `file` is a React Native upload descriptor (has a `uri`).
 */
const isReactNativeUploadFile = (
  file: UploadFileInput,
): file is ReactNativeUploadFile =>
  typeof file === "object" &&
  file !== null &&
  "uri" in file &&
  typeof file.uri === "string";

/**
 * Builds auth and client headers required by storage endpoints.
 */
const getUploadHeaders = (): Record<string, string> => {
  const authStore = useAuthPersistStore.getState();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (authStore.accessToken) {
    headers.Authorization = `Bearer ${authStore.accessToken}`;
  }

  if (timezone) {
    headers["x-timezone"] = timezone;
  }

  return headers;
};

/**
 * Normalizes byte counts into a 0–99 progress percentage.
 * Falls back to a KB-based estimate when the total size is unknown
 * (common with axios FormData uploads on React Native).
 */
const reportUploadProgress = (
  onProgress: ((percent: number) => void) | undefined,
  loaded: number,
  total?: number,
): void => {
  if (!onProgress) return;

  if (total && total > 0) {
    onProgress(Math.min(99, Math.round((loaded * 100) / total)));
    return;
  }

  if (loaded > 0) {
    onProgress(Math.min(95, Math.max(1, Math.round(loaded / 2048))));
  }
};

/**
 * Uploads one file on iOS/Android via expo-file-system `File.upload`,
 * which reports reliable byte-level progress.
 *
 * @param finalizeProgress - When false, skips the final 100% callback so
 *   callers can aggregate progress across a multi-file batch.
 */
const uploadNativeFile = async (
  file: ReactNativeUploadFile,
  onProgress: ((percent: number) => void) | undefined,
  temporary: boolean,
  finalizeProgress = true,
): Promise<Upload> => {
  const expoFile = new ExpoFile(file.uri);
  const endpoint = temporary ? "/storage/upload/temporary" : "/storage/upload";

  const result = await expoFile.upload(`${BASE_URL}${endpoint}`, {
    uploadType: UploadType.MULTIPART,
    fieldName: "file",
    mimeType: file.type,
    headers: getUploadHeaders(),
    onProgress: ({ bytesSent, totalBytes }) => {
      reportUploadProgress(onProgress, bytesSent, totalBytes);
    },
  });

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed with status ${result.status}`);
  }

  if (finalizeProgress) {
    onProgress?.(100);
  }

  return JSON.parse(result.body) as Upload;
};

/**
 * Uploads multiple native files sequentially, mapping per-file progress
 * into a single 0–100 value for the whole batch.
 */
const uploadNativeFiles = async (
  files: ReactNativeUploadFile[],
  onProgress: ((percent: number) => void) | undefined,
  temporary: boolean,
): Promise<Upload[]> => {
  const uploads: Upload[] = [];
  onProgress?.(0);

  for (let i = 0; i < files.length; i++) {
    const upload = await uploadNativeFile(
      files[i],
      (filePercent) => {
        const overall = Math.round((i * 100 + filePercent) / files.length);
        onProgress?.(Math.min(99, overall));
      },
      temporary,
      false,
    );
    uploads.push(upload);
  }

  onProgress?.(100);
  return uploads;
};

/**
 * Uploads a single file to storage.
 *
 * - **Native:** uses expo-file-system for accurate progress.
 * - **Web:** uses axios multipart POST to `/storage/upload[/temporary]`.
 */
export const uploadFile = async (
  file: UploadFileInput,
  onProgress?: (percent: number) => void,
  temporary: boolean = true,
): Promise<Upload> => {
  if (Platform.OS !== "web" && isReactNativeUploadFile(file)) {
    return uploadNativeFile(file, onProgress, temporary);
  }

  const formData = new FormData();
  formData.append("file", file as File);

  onProgress?.(0);

  const response = await axios.post<Upload>(
    temporary ? "/storage/upload/temporary" : "/storage/upload",
    formData,
    {
      headers: {
        Accept: "application/json",
      },
      onUploadProgress: (event) => {
        reportUploadProgress(onProgress, event.loaded, event.total);
      },
    },
  );

  onProgress?.(100);
  return response.data;
};

/**
 * Uploads one or more files to storage.
 *
 * - **Native:** uploads each file sequentially via expo-file-system and
 *   aggregates progress across the batch.
 * - **Web:** sends all files in one axios multipart POST to
 *   `/storage/multiple[/temporary]`. Pass `totalBytes` when known to improve
 *   progress reporting if the server omits Content-Length.
 */
export const uploadFiles = async (
  files: UploadFileInput[],
  onProgress?: (percent: number) => void,
  temporary: boolean = true,
  totalBytes?: number,
): Promise<Upload[]> => {
  if (
    Platform.OS !== "web" &&
    files.length > 0 &&
    files.every(isReactNativeUploadFile)
  ) {
    return uploadNativeFiles(files, onProgress, temporary);
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file as File);
  });

  onProgress?.(0);

  const response = await axios.post<Upload[]>(
    temporary ? "/storage/multiple/temporary" : "/storage/multiple",
    formData,
    {
      headers: {
        Accept: "application/json",
      },
      onUploadProgress: (event) => {
        reportUploadProgress(
          onProgress,
          event.loaded,
          event.total || totalBytes,
        );
      },
    },
  );

  onProgress?.(100);
  return response.data;
};

/**
 * Returns an expo-image source for a stored upload, including auth headers.
 * expo-image handles streaming, caching, and progressive loading natively.
 */
export const getUploadById = (id: number) => {
  const authStore = useAuthPersistStore.getState();
  return {
    uri: `${BASE_URL}/storage/view/id/${id}`,
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`,
    },
  };
};

/**
 * Returns an expo-image source for a stored upload looked up by slug,
 * including auth headers.
 */
export const getUploadBySlug = (slug: string) => {
  const authStore = useAuthPersistStore.getState();
  return {
    uri: `${BASE_URL}/storage/view/slug/${slug}`,
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`,
    },
  };
};

export const upload = {
  uploadFile,
  uploadFiles,
  getUploadBySlug,
  getUploadById,
};
