import { ResponseSessionDto } from "./session";
import { ResponseUserDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export enum RequestEvent {
  Accept = "Accept",
  Reject = "Reject",
}

export enum RequestStatus {
  Sent = "Sent",
  Accepted = "Accepted",
  Rejected = "Rejected",
  Expired = "Expired",
}

export interface ResponseRequestDto extends DatabaseEntity {
  id: number;
  sessionId: number;
  session: ResponseSessionDto;
  receivers: ResponseUserDto[];
  status?: RequestStatus;
  message?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  time?: Date;
}

export interface ResponseRequestWorkflowDto {
  status: RequestStatus;
  request: ResponseRequestDto;
}

export interface CreateRequestDto {
  receiverIds: string[];
  message?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  time?: Date;
}

export interface UpdateRequestStatusDto {
  event: RequestEvent;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateRequestDto extends Partial<CreateRequestDto> {}
