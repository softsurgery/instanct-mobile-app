import { ResponseClientDto } from "./user-management";
import { DatabaseEntity } from "./utils";

export interface CreateGeolocationDto {
  latitude: number;
  longitude: number;
}

export interface ResponseGeolocationDto extends DatabaseEntity {
  id: number;
  latitude: number;
  longitude: number;
  user: ResponseClientDto;
  userId: string;
}

export interface NearbyUser {
  latitude: number;
  longitude: number;
  user?: ResponseClientDto | null;
  userId: string;
  distance?: number;
  isOnline?: boolean;
  profilePicture?: React.ReactNode;
  updatedAt: string;
}

export interface Cluster {
  latitude: number;
  longitude: number;
  users: NearbyUser[];
}
