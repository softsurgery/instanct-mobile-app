import { ResponseUserDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export enum NotificationType {
  TEST = "TEST",
  NEW_SIGNIN = "NEW_SIGNIN",
  REQUEST_RECEIVED = "REQUEST_RECEIVED",
  REQUEST_ACCEPTED = "REQUEST_ACCEPTED",
  REQUEST_REJECTED = "REQUEST_REJECTED",
}

export interface ResponseNotificationDto extends DatabaseEntity {
  id: string;
  type: NotificationType;
  userId?: string;
  user: ResponseUserDto;
  payload?: any;
  readAt?: Date | null;
}
