import { ResponseClientDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export interface ResponseConversationDto extends DatabaseEntity {
  id: number;
  participants: ResponseClientDto[];
  messages: ResponseMessageDto[];
}

export interface ResponseMessageDto extends DatabaseEntity {
  id: number;
  content: string;
  conversationId: number;
  conversation: ResponseConversationDto;
  userId: string;
  user: ResponseClientDto;
}

export interface GroupedMessages {
  date: string;
  messages: ResponseMessageDto[];
}
