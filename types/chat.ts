import { ResponseUserDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export interface ResponseConversationDto extends DatabaseEntity {
  id: number;
  participants: ResponseConversationUserDto[];
  messages: ResponseMessageDto[];
  lastMessage: ResponseMessageDto;
}

export interface ResponseMessageDto extends DatabaseEntity {
  id: number;
  content: string;
  conversationId: number;
  conversation: ResponseConversationDto;
  userId: string;
  user: ResponseUserDto;
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
