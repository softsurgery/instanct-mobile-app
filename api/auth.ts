import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import * as AuthSession from "expo-auth-session";
import {
  RequestClientSignInDto,
  RequestSpecializedClientSignUpDto,
  ResponseClientSigninDto,
  RequestClientUpdateMailDto,
  RequestClientUpdatePasswordDto,
  RequestClientOAuthDto,
} from "@/types";
import axios from "./axios";

import { getClientDeviceInfo } from "@/lib/device-info";
import { getDeviceId } from "@/lib/device-id";

const saveToken = (access_token: string, refresh_token: string) => {
  const authPersistStore = useAuthPersistStore.getState();
  authPersistStore.setAccessToken(access_token);
  authPersistStore.setRefreshToken(refresh_token);
  authPersistStore.setAuthenticated(true);
};

const signIn = async (
  requestClientSignInDto: RequestClientSignInDto,
): Promise<ResponseClientSigninDto> => {
  const deviceInfo = getClientDeviceInfo();
  const fingerprint = await getDeviceId();
  const response = await axios.post("/client-auth/sign-in", {
    device: deviceInfo.device,
    os: deviceInfo.os,
    ...requestClientSignInDto,
    fingerprint: requestClientSignInDto.fingerprint || fingerprint,
  });
  saveToken(response.data.access_token, response.data.refresh_token);
  return response.data;
};

const ssoSignIn = async (
  request: RequestClientOAuthDto,
): Promise<ResponseClientSigninDto> => {
  const deviceInfo = getClientDeviceInfo();
  const fingerprint = await getDeviceId();
  const response = await axios.post("/client-auth/oauth", {
    device: deviceInfo.device,
    os: deviceInfo.os,
    ...request,
    fingerprint: request.fingerprint || fingerprint,
  });
  saveToken(response.data.access_token, response.data.refresh_token);
  return response.data;
};

const signUp = async (request: RequestSpecializedClientSignUpDto) => {
  const response = await axios.post("/client-custom-auth/sign-up", request);
  return response.data;
};

const sendVerifyEmail = async (email?: string) => {
  const deepLinkUri = AuthSession.makeRedirectUri({
    path: "main/profile/email-success",
  });
  const response = await axios.post("/client-auth/send-verify-email", {
    email,
    callbackUrl: deepLinkUri,
  });
  return response.data;
};

const verifyEmail = async (token: string) => {
  const response = await axios.post("/client-auth/verify-email", { token });
  return response.data;
};

const updateEmail = async (request: RequestClientUpdateMailDto) => {
  const deepLinkUri = AuthSession.makeRedirectUri({
    path: "main/profile/email-success",
  });
  const response = await axios.post("/client-auth/update-email", {
    ...request,
    callbackUrl: deepLinkUri,
  });
  return response.data;
};

const updatePassword = async (request: RequestClientUpdatePasswordDto) => {
  const response = await axios.post("/client-auth/update-password", request);
  return response.data;
};

export const auth = {
  signIn,
  ssoSignIn,
  signUp,
  sendVerifyEmail,
  verifyEmail,
  updateEmail,
  updatePassword,
};
