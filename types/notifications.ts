import { ResponseUserDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export enum NotificationType {
  TEST = "TEST",
  NEW_SIGNIN = "NEW_SIGNIN",
  REQUEST_RECEIVED = "REQUEST_RECEIVED",
  // NEW_MESSAGE = "NEW_MESSAGE",
}

export interface ResponseNotificationDto extends DatabaseEntity {
  id: string;
  type: NotificationType;
  userId?: string;
  user: ResponseUserDto;
  payload?: any;
}
