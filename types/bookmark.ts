import { ResponseUserDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export interface ResponseUserBookmarkDto extends DatabaseEntity {
  id: number;
  userId: string;
  user?: ResponseUserDto;
  bookmarkId: string;
  bookmark?: ResponseUserDto;
}
