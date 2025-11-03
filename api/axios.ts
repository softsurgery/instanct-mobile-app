import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import _axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const axios = _axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
axios.interceptors.request.use(
  function (config) {
    const authStore = useAuthPersistStore.getState();

    if (authStore.accessToken) {
      config.headers["Authorization"] = `Bearer ${authStore.accessToken}`;
    }

    return config;
  },
  function (err) {
    return Promise.reject(err);
  }
);

axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthPersistStore.getState();

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (authStore.refreshToken) {
        try {
          const response = await _axios.post(`${BASE_URL}/auth/refresh-token`, {
            refresh_token: authStore.refreshToken,
          });

          const newAccessToken = response.data.access_token;
          useAuthPersistStore.getState().setAccessToken(newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          return axios(originalRequest);
        } catch (err) {
          authStore.logout?.();
          return Promise.reject(err);
        }
      } else {
        authStore.logout?.();
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
