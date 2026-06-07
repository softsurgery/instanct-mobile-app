import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import {
  RequestClientSignInDto,
  RequestSpecializedClientSignUpDto,
  ResponseClientSigninDto,
  RequestClientUpdateMailDto,
  RequestClientUpdatePasswordDto,
} from "@/types";
import axios from "./axios";

const saveToken = (access_token: string, refresh_token: string) => {
  const authPersistStore = useAuthPersistStore.getState();
  authPersistStore.setAccessToken(access_token);
  authPersistStore.setRefreshToken(refresh_token);
  authPersistStore.setAuthenticated(true);
};

const signIn = async (
  requestClientSignInDto: RequestClientSignInDto,
): Promise<ResponseClientSigninDto> => {
  const response = await axios.post(
    "/client-auth/sign-in",
    requestClientSignInDto,
  );
  saveToken(response.data.access_token, response.data.refresh_token);
  return response.data;
};

const signUp = async (request: RequestSpecializedClientSignUpDto) => {
  const response = await axios.post("/client-custom-auth/sign-up", request);
  return response.data;
};

const sendVerifyEmail = async (email?: string) => {
  const response = await axios.post("/client-auth/send-verify-email", {
    email,
  });
  return response.data;
};

const verifyEmail = async (token: string) => {
  const response = await axios.post("/client-auth/verify-email", { token });
  return response.data;
};

const updateEmail = async (request: RequestClientUpdateMailDto) => {
  const response = await axios.post("/client-auth/update-email", request);
  return response.data;
};

const updatePassword = async (request: RequestClientUpdatePasswordDto) => {
  const response = await axios.post("/client-auth/update-password", request);
  return response.data;
};

export const auth = {
  signIn,
  signUp,
  sendVerifyEmail,
  verifyEmail,
  updateEmail,
  updatePassword,
};
