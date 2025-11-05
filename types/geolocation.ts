import { ResponseClientDto } from "./client";
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
  userId: string;
  latitude: number;
  longitude: number;
  distance?: number;
  isOnline?: boolean;
  updatedAt: string;
}
