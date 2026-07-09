import { ResponseUserDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export enum MessageVariant {
  TEXT = "text",
  STATIC = "static",
  EMOJI = "emoji",
  IMAGE = "image",
  VIDEO = "video",
  FILE = "file",
}

export interface ResponseConversationDto extends DatabaseEntity {
  id: number;
  participants: ResponseConversationUserDto[];
  messages: ResponseMessageDto[];
  lastMessage: ResponseMessageDto;
  variant: MessageVariant;
  static?: StaticMessageEnum;
  locked: boolean;
}

export interface ResponseMessageDto extends DatabaseEntity {
  id: number;
  content: string;
  conversationId: number;
  conversation: ResponseConversationDto;
  userId: string;
  user: ResponseUserDto;
  variant?: MessageVariant;
  static?: StaticMessageEnum;
  uploads?: ResponseMessageUploadDto[];
  links?: ResponseMessageLinkDto[];
}

export interface ResponseMessageLinkDto extends DatabaseEntity {
  id: number;
  messageId: number;
  url: string;
  startOffset: number;
  endOffset: number;
  order: number;
}

export interface ResponseMessageUploadDto extends DatabaseEntity {
  id: number;
  messageId: number;
  uploadId: number;
  upload?: ResponseMessageUploadFileDto;
  order: number;
}

export interface ResponseMessageUploadFileDto extends DatabaseEntity {
  id: number;
  slug: string;
  filename: string;
  mimetype: string;
  size: number;
  isTemporary: boolean;
  isPrivate: boolean;
}

export interface CreateConversationDto {
  users: string[];
}

export interface ResponseConversationUserDto extends DatabaseEntity {
  id: number;
  userId: string;
  conversationId: number;
  user: ResponseUserDto;
  lastCheck: Date;
}

export interface GroupedMessages {
  date: string;
  messages: ResponseMessageDto[];
}

export enum StaticMessageEnum {
  FIRST_MESSAGE = "First Message",
  POKE = "Poke",
}

export type PendingMediaItem = {
  uri: string;
  kind: MediaKind;
};

export type PendingMediaUpload = {
  clientId: string;
  conversationId: number;
  items: PendingMediaItem[];
  variant: MessageVariant.IMAGE | MessageVariant.VIDEO;
  progress: number;
  status: "uploading" | "sending" | "failed";
  createdAt: Date;
  uploadIds?: number[];
  content?: string;
};

export type PendingTextMessage = {
  clientId: string;
  conversationId: number;
  content: string;
  createdAt: Date;
  status: "pending" | "failed";
};

export type PendingFileItem = {
  filename: string;
  mimetype?: string;
  fileSize?: number;
};

export type PendingFileUpload = {
  clientId: string;
  conversationId: number;
  items: PendingFileItem[];
  progress: number;
  status: "uploading" | "sending" | "failed";
  createdAt: Date;
  uploadIds?: number[];
  content?: string;
};

export type MessageFlatListItem =
  | { type: "header"; date: string; key: string }
  | { type: "message"; message: ResponseMessageDto }
  | { type: "media"; message: ResponseMessageDto }
  | { type: "file"; message: ResponseMessageDto }
  | { type: "static"; message: ResponseMessageDto }
  | { type: "pending-media"; key: string; pending: PendingMediaUpload }
  | { type: "pending-file"; key: string; pending: PendingFileUpload }
  | { type: "pending-text"; key: string; pending: PendingTextMessage };

export type MediaKind = "image" | "video";

export enum ConversationReportReason {
  SPAM = "Spam",
  HARASSMENT = "Harassment",
  INAPPROPRIATE_CONTENT = "Inappropriate Content",
  SCAM = "Scam or Fraud",
  OTHER = "Other",
}

export interface CreateConversationReportDto {
  reason?: ConversationReportReason;
  description: string;
}

export interface StagedMedia {
  id: string;
  file: File;
  kind: MediaKind;
  uri: string;
  fileSize?: number;
}
