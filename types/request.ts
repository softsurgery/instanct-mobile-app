import { ResponseUserDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export interface ResponseRequestDto extends DatabaseEntity {
  id: number;
  senderId: string;
  sender: ResponseUserDto;
  receivers: ResponseUserDto[];
  description?: string;
  place?: string;
  time?: Date;
}

export interface CreateRequestDto {
  senderId: string;
  receivers: string[];
  description?: string;
  place?: string;
  time?: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateRequestDto extends Partial<CreateRequestDto> {}
