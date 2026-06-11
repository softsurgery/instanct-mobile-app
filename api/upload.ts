import { Buffer } from "buffer";
import { Platform } from "react-native";
import { Upload } from "~/types/upload";
import axios from "./axios";

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

export const getUploadById = async (id: number) => {
  const url = `/storage/view/id/${id}`;
  const { data, headers } = await axios.get(url, {
    responseType: "arraybuffer",
  });

  const mimeType = headers["content-type"] || "application/octet-stream";

  if (Platform.OS === "web") {
    const blob = new Blob([data], { type: mimeType });
    return URL.createObjectURL(blob);
  } else {
    const base64 = Buffer.from(data, "binary").toString("base64");
    return `data:${mimeType};base64,${base64}`;
  }
};

export const getUploadBySlug = async (slug: string) => {
  const url = `/storage/view/slug/${slug}`;
  const { data, headers } = await axios.get(url, {
    responseType: "arraybuffer",
  });

  const mimeType = headers["content-type"] || "application/octet-stream";

  if (Platform.OS === "web") {
    const blob = new Blob([data], { type: mimeType });
    return URL.createObjectURL(blob);
  } else {
    const base64 = Buffer.from(data, "binary").toString("base64");
    return `data:${mimeType};base64,${base64}`;
  }
};

export const upload = {
  uploadFiles,
  getUploadBySlug,
  getUploadById,
};
