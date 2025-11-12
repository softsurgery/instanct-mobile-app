import { ResponseClientDto } from "./client";
import { DatabaseEntity } from "./utils";

export enum NotificationType {
  TEST = "TEST",
  NEW_SIGIN = "NEW_SIGIN",
  NEW_MESSAGE = "NEW_MESSAGE",
}

export interface ResponseNotificationDto extends DatabaseEntity {
  id: string;
  type: NotificationType;
  userId?: string;
  user: ResponseClientDto;
  payload?: any;
}
