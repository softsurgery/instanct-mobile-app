import { ResponseUserDto } from "./user-management";

export interface ResponseClientSigninDto {
  access_token: string;
  refresh_token: string;
}

export interface RequestClientSignInDto {
  email: string;
  password: string;
}

export interface RequestClientSignUpDto {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export interface ResponseClientSignupDto {
  user: ResponseUserDto;
}
