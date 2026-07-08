export type DocumentFileType =
  | "pdf"
  | "word"
  | "excel"
  | "powerpoint"
  | "text"
  | "image"
  | "archive"
  | "audio"
  | "video"
  | "code"
  | "generic";

export type FileTypeStyle = {
  type: DocumentFileType;
  color: string;
  backgroundColor: string;
  label: string;
};

const FILE_TYPE_STYLES: Record<DocumentFileType, Omit<FileTypeStyle, "type">> =
  {
    pdf: {
      color: "#DC2626",
      backgroundColor: "rgba(220, 38, 38, 0.12)",
      label: "PDF",
    },
    word: {
      color: "#2563EB",
      backgroundColor: "rgba(37, 99, 235, 0.12)",
      label: "Word",
    },
    excel: {
      color: "#16A34A",
      backgroundColor: "rgba(22, 163, 74, 0.12)",
      label: "Excel",
    },
    powerpoint: {
      color: "#EA580C",
      backgroundColor: "rgba(234, 88, 12, 0.12)",
      label: "PowerPoint",
    },
    text: {
      color: "#64748B",
      backgroundColor: "rgba(100, 116, 139, 0.12)",
      label: "Text",
    },
    image: {
      color: "#9333EA",
      backgroundColor: "rgba(147, 51, 234, 0.12)",
      label: "Image",
    },
    archive: {
      color: "#D97706",
      backgroundColor: "rgba(217, 119, 6, 0.12)",
      label: "Archive",
    },
    audio: {
      color: "#DB2777",
      backgroundColor: "rgba(219, 39, 119, 0.12)",
      label: "Audio",
    },
    video: {
      color: "#7C3AED",
      backgroundColor: "rgba(124, 58, 237, 0.12)",
      label: "Video",
    },
    code: {
      color: "#0D9488",
      backgroundColor: "rgba(13, 148, 136, 0.12)",
      label: "Code",
    },
    generic: {
      color: "#6B7280",
      backgroundColor: "rgba(107, 114, 128, 0.12)",
      label: "File",
    },
  };

const EXTENSION_TYPE_MAP: Record<string, DocumentFileType> = {
  pdf: "pdf",
  doc: "word",
  docx: "word",
  rtf: "word",
  odt: "word",
  xls: "excel",
  xlsx: "excel",
  csv: "excel",
  ods: "excel",
  ppt: "powerpoint",
  pptx: "powerpoint",
  odp: "powerpoint",
  txt: "text",
  md: "text",
  markdown: "text",
  log: "text",
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  bmp: "image",
  heic: "image",
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  tar: "archive",
  gz: "archive",
  mp3: "audio",
  wav: "audio",
  m4a: "audio",
  aac: "audio",
  ogg: "audio",
  flac: "audio",
  mp4: "video",
  mov: "video",
  avi: "video",
  mkv: "video",
  webm: "video",
  json: "code",
  xml: "code",
  html: "code",
  htm: "code",
  js: "code",
  ts: "code",
  jsx: "code",
  tsx: "code",
  css: "code",
  yaml: "code",
  yml: "code",
};

const MIME_TYPE_MAP: Record<string, DocumentFileType> = {
  "application/pdf": "pdf",
  "application/msword": "word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "word",
  "application/vnd.ms-excel": "excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "excel",
  "text/csv": "excel",
  "application/vnd.ms-powerpoint": "powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "powerpoint",
  "text/plain": "text",
  "text/markdown": "text",
  "image/jpeg": "image",
  "image/png": "image",
  "image/gif": "image",
  "image/webp": "image",
  "image/svg+xml": "image",
  "application/zip": "archive",
  "application/x-rar-compressed": "archive",
  "application/x-7z-compressed": "archive",
  "application/gzip": "archive",
  "application/x-tar": "archive",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
  "audio/mp4": "audio",
  "video/mp4": "video",
  "video/quicktime": "video",
  "application/json": "code",
  "text/html": "code",
  "text/xml": "code",
  "application/xml": "code",
};

export const getFileExtension = (filename?: string | null) => {
  if (!filename) return undefined;

  const baseName = filename.split("/").pop()?.trim() ?? filename;
  const parts = baseName.split(".");
  if (parts.length < 2) return undefined;

  return parts.pop()?.toLowerCase();
};

export const detectFileType = (
  filename?: string | null,
  mimetype?: string | null,
): DocumentFileType => {
  const normalizedMime = mimetype?.split(";")[0]?.trim().toLowerCase();
  if (normalizedMime && MIME_TYPE_MAP[normalizedMime]) {
    return MIME_TYPE_MAP[normalizedMime];
  }

  if (normalizedMime?.startsWith("image/")) return "image";
  if (normalizedMime?.startsWith("audio/")) return "audio";
  if (normalizedMime?.startsWith("video/")) return "video";
  if (normalizedMime?.startsWith("text/")) return "text";

  const extension = getFileExtension(filename);
  if (extension && EXTENSION_TYPE_MAP[extension]) {
    return EXTENSION_TYPE_MAP[extension];
  }

  return "generic";
};

export const getFileTypeStyle = (
  filename?: string | null,
  mimetype?: string | null,
): FileTypeStyle => {
  const type = detectFileType(filename, mimetype);
  return {
    type,
    ...FILE_TYPE_STYLES[type],
  };
};
