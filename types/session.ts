import { ResponseUserDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export enum SessionType {
  DEFAULT = "",
  MAP_SESSION = "map-session",
}

export interface ResponseSessionDto<T = any> extends DatabaseEntity {
  id: number;
  userId?: string;
  user: ResponseUserDto;
  sessionType: SessionType;
  plannedStart?: Date;
  plannedEnd?: Date;
  started?: Date;
  ended?: Date;
  payload?: T;
}

export interface CreateSessionDto<T = any> {
  sessionType: SessionType;
  plannedStart?: Date;
  plannedEnd?: Date;
  payload?: T;
}

export interface MapSessionPayload {
  objectives: string[];
}
