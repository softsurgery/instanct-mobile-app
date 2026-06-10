import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { useLogout } from "@/hooks/useLogout";
import { delay } from "@/lib/time";
import _axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const GLOBAL_DELAY = process.env.EXPO_PUBLIC_GLOBAL_DELAY
  ? parseInt(process.env.EXPO_PUBLIC_GLOBAL_DELAY)
  : 0;

const axios = _axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
axios.interceptors.request.use(
  async function (config) {
    await delay(GLOBAL_DELAY);
    const authStore = useAuthPersistStore.getState();

    if (authStore.accessToken) {
      config.headers["Authorization"] = `Bearer ${authStore.accessToken}`;
    }

    // Send client timezone so the server can resolve time-sensitive queries
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      config.headers["x-timezone"] = timezone;
    }

    return config;
  },
  function (err) {
    return Promise.reject(err);
  },
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
          const response = await _axios.post(
            `${BASE_URL}/client-auth/refresh-token`,
            {
              refresh_token: authStore.refreshToken,
            },
          );

          const { access_token, refresh_token } = response.data;
          authStore.setAccessToken(access_token);
          if (refresh_token) {
            authStore.setRefreshToken(refresh_token);
          }
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;

          return axios(originalRequest);
        } catch (err) {
          const logout = useLogout();
          logout();
          return Promise.reject(err);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default axios;
