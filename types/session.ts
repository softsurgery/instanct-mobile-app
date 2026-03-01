import { ResponseUserDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export enum SessionType {
  DEFAULT = "",
  MAP_SESSION = "map-session",
}

export interface ResponseSessionDto extends DatabaseEntity {
  id: number;
  userId?: string;
  user: ResponseUserDto;
  sessionType: SessionType;
  plannedStart?: Date;
  plannedEnd?: Date;
  started?: Date;
  ended?: Date;
  payload?: object;
}

export interface CreateSessionDto {
  sessionType: SessionType;
  plannedStart?: Date;
  plannedEnd?: Date;
  payload?: object;
}
