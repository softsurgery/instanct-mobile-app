import { ResponseSessionDto } from "./session";
import { ResponseUserDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export interface ResponseRequestDto extends DatabaseEntity {
  id: number;
  sessionId: number;
  session: ResponseSessionDto;
  receivers: ResponseUserDto[];
  message?: string;
  location?: string;
  time?: Date;
}

export interface CreateRequestDto {
  receiverIds: string[];
  message?: string;
  location?: string;
  time?: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateRequestDto extends Partial<CreateRequestDto> {}
