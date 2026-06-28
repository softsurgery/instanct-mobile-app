import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { Upload } from "~/types/upload";
import axios from "./axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const uploadFiles = async (
  files: File[],
  onProgress?: (percent: number) => void,
  temporary: boolean = true,
): Promise<Upload[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await axios.post<Upload[]>(
    temporary ? "/storage/multiple/temporary" : "/storage/multiple",
    formData,
    {
      headers: {
        Accept: "application/json",
      },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      },
    },
  );
  return response.data;
};

/**
 * Returns an ImageSource with a direct URL and auth headers.
 * expo-image handles streaming, caching, and progressive loading natively —
 * no binary download or base64 conversion needed.
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
 * Returns an ImageSource with a direct URL and auth headers.
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
  uploadFiles,
  getUploadBySlug,
  getUploadById,
};
