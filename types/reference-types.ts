import { DatabaseEntity } from "./utils";

export interface ResponseRefTypeDto<T = object> extends DatabaseEntity {
  id: number;
  label: string;
  description: string;
  refParams: ResponseRefParamDto[];
  parentId?: number;
  parent?: ResponseRefTypeDto;
  children: ResponseRefTypeDto[];
  extras: T;
}

export interface CreateRefTypeDto<T = object> {
  label: string;
  description: string;
  parentId?: number;
  extras: T;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateRefTypeDto<T = object>
  extends Partial<CreateRefTypeDto<T>> {}

export interface ResponseRefParamDto<T = object> extends DatabaseEntity {
  id: number;
  label: string;
  description: string;
  refTypeId: number;
  refType: ResponseRefTypeDto;
  extras: T;
}

export interface CreateRefParamDto<T = object> {
  label: string;
  description: string;
  refTypeId?: number;
  extras: T;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateRefParamDto<T = object>
  extends Partial<CreateRefParamDto<T>> {}
