import { Upload } from "./upload";
import { DatabaseEntity } from "./utils/database-entity";

//abstract user dtos *****************************************************************************

interface ResponseAbstractUsertDto extends DatabaseEntity {
  id: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  isActive?: boolean;
  username: string;
  email: string;
  emailVerified?: Date;
}

interface CreateAbstractUserDto {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  isActive?: boolean;
  password?: string;
  username: string;
  email: string;
  roleId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UpdateAbstractUserDto extends Partial<CreateAbstractUserDto> {}

// user dtos ************************************************************************************

export interface ResponseUserDto extends ResponseAbstractUsertDto {
  phone?: string;
  cin?: string;
  bio?: string;
  gender?: Gender;
  isPrivate?: boolean;
  pictureId?: number;
  picture?: Upload;
  experiences?: Experience[] | null;
  educations?: Education[] | null;
  skills?: Skill[] | null;
}

export interface CreateUserDto extends CreateAbstractUserDto {
  phone?: string;
  cin?: string;
  bio?: string;
  gender?: Gender;
  isPrivate?: boolean;
  pictureId?: number;
  officialDocumentId?: number;
  driverLicenseDocumentId?: number;
  uploads?: Upload[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateUserDto extends Partial<CreateUserDto> {}

export enum Gender {
  Male = "Male",
  Female = "Female",
}

export interface ResponseFollowCountsDto {
  followers: number;
  following: number;
}

export interface ResponseIsFollowingDto {
  userId?: string;
  targetId?: string;
  isFollowing?: boolean;
}

export interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  startYear: number;
  endYear: number;
}

export interface Skill {
  name: string;
}
