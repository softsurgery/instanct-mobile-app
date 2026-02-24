import { ResponseUserDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export enum SessionType {
  MAP_SESSION = "map-session",
}

export interface ResponseSessionDto extends DatabaseEntity {
  id: number;
  userId?: string;
  user: ResponseUserDto;
  type: SessionType;
  planned_start?: Date;
  planned_end?: Date;
  started?: Date;
  ended?: Date;
  payload?: object;
}

export interface CreateSessionDto {
  type: SessionType;
  planned_start?: Date;
  planned_end?: Date;
  payload?: object;
}
