import { ResponseUserDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export enum MessageVariant {
  TEXT = "text",
  STATIC = "static",
  EMOJI = "emoji",
  IMAGE = "image",
  VIDEO = "video",
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

export type PendingMediaUpload = {
  clientId: string;
  uri: string;
  kind: "image" | "video";
  variant: MessageVariant.IMAGE | MessageVariant.VIDEO;
  progress: number;
  status: "uploading" | "failed";
  createdAt: Date;
  uploadId?: number;
  content?: string;
};

export type MessageFlatListItem =
  | { type: "header"; date: string; key: string }
  | { type: "message"; message: ResponseMessageDto }
  | { type: "media"; message: ResponseMessageDto }
  | { type: "static"; message: ResponseMessageDto }
  | { type: "pending-media"; key: string; pending: PendingMediaUpload };
