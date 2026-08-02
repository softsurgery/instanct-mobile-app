import { ResponseUserDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export interface CreateGeolocationDto {
  latitude: number;
  longitude: number;
}

export interface ResponseGeolocationDto extends DatabaseEntity {
  id: number;
  latitude: number;
  longitude: number;
  user: ResponseUserDto;
  userId: string;
}

export interface NearbyUser {
  latitude: number;
  longitude: number;
  user?: ResponseUserDto;
  userId: string;
  distance?: number | null;
  isOnline?: boolean;
  coordinatesVisible?: boolean;
  profilePicture?: React.ReactNode;
  updatedAt: string;
}

export interface Cluster {
  latitude: number;
  longitude: number;
  users: NearbyUser[];
}
