import { ResponseRefParamDto } from "./reference-types";
import { ResponseSessionDto } from "./session";
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
  sessions?: ResponseSessionDto[];
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
interface UpdateAbstractUserDto extends Partial<CreateAbstractUserDto> {}

// user dtos ************************************************************************************

export interface ResponseUserDto extends ResponseAbstractUsertDto {
  phone?: string;
  cin?: string;
  bio?: string;
  gender?: Gender;
  website?: string;
  linkedin?: string;
  isPrivate?: boolean;
  pictureId?: number;
  picture?: Upload;
  coverId?: number;
  cover?: Upload;
  experiences?: ResponseExperienceDto[];
  educations?: ResponseEducationDto[];
  industries?: ResponseRefParamDto[];
  activeSession?: ResponseSessionDto;
}

export interface CreateUserDto extends CreateAbstractUserDto {
  phone?: string;
  cin?: string;
  bio?: string;
  gender?: Gender;
  website?: string;
  linkedin?: string;
  isPrivate?: boolean;
  pictureId?: number;
  officialDocumentId?: number;
  driverLicenseDocumentId?: number;
  uploads?: Upload[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateUserDto extends Partial<CreateUserDto> {}

export interface UpdateUserCoverDto {
  coverId?: number;
}

export enum Gender {
  Male = "Male",
  Female = "Female",
}

//experience dtos *****************************************************************************

export enum WorkTypes {
  FULL_TIME = "Full-Time",
  PART_TIME = "Part-Time",
  TEMPORARY = "Temporary",
  INTERN = "Internship",
  FREELANCE = "Freelance",
  VOLUNTEER = "Volunteer",
  APPRENTICESHIP = "Apprenticeship",
}

export enum LocationTypes {
  REMOTE = "Remote",
  ON_SITE = "On-Site",
  HYBRID = "Hybrid",
}

export interface ResponseExperienceDto extends DatabaseEntity {
  id: number;
  title?: string;
  company?: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
  location?: string;
  locationType?: LocationTypes;
  workType?: WorkTypes;
  user?: ResponseUserDto;
  userId: string;
}

export interface CreateExperienceDto {
  title?: string;
  company?: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
  location?: string;
  locationType?: LocationTypes;
  workType?: WorkTypes;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateExperienceDto extends Partial<CreateExperienceDto> {}

//education dtos *****************************************************************************

export interface ResponseEducationDto extends DatabaseEntity {
  id: number;
  title: string;
  startDate?: Date;
  endDate?: Date | null;
  institution: string;
  description: string;
  user: ResponseUserDto;
  userId: string;
}

export interface CreateEducationDto {
  title: string;
  startDate?: Date;
  endDate?: Date | null;
  institution: string;
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateEducationDto extends Partial<CreateEducationDto> {}

// user configuration dtos *****************************************************************************
export interface UpdateUserMapConfigurationDto {
  radius: number;
  clusters: boolean;
  showUsernames: boolean;
}
