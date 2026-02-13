import { ResponseRefParamDto } from "./reference-types";
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
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
  experiences?: ResponseExperienceDto[];
  educations?: ResponseEducationDto[];
  objectives?: ResponseRefParamDto[];
  industries?: ResponseRefParamDto[];
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

//experience dtos *****************************************************************************

export interface ResponseExperienceDto extends DatabaseEntity {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  company: string;
  description: string;
  user: ResponseUserDto;
  userId: string;
}

export interface CreateExperienceDto {
  title: string;
  startDate: Date;
  endDate: Date | null;
  company: string;
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateExperienceDto extends Partial<CreateExperienceDto> {}

//education dtos *****************************************************************************

export interface ResponseEducationDto extends DatabaseEntity {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date | null;
  institution: string;
  description: string;
  user: ResponseUserDto;
  userId: string;
}

export interface CreateEducationDto {
  title: string;
  startDate: Date;
  endDate: Date | null;
  institution: string;
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateEducationDto extends Partial<CreateEducationDto> {}

// user configuration dtos *****************************************************************************
export interface UpdateUserMapConfigurationDto {
  radius: number;
}
