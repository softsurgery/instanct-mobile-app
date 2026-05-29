import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import {
  RequestClientSignInDto,
  RequestSpecializedClientSignUpDto,
  ResponseClientSigninDto,
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

export const auth = {
  signIn,
  signUp,
};
