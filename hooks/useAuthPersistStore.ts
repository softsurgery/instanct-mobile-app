import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthPersistData {
  accessToken: string;
  refreshToken: string;
  isAuthenticated: boolean;
}

interface AuthPersistStore extends AuthPersistData {
  isReady: boolean;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setAuthenticated: (isAuth: boolean) => void;
  logout: () => void;
}

const authPersistStore: AuthPersistData = {
  accessToken: "",
  refreshToken: "",
  isAuthenticated: false,
};

let _set: (fn: Partial<AuthPersistStore>) => void;

const isClient = typeof window !== "undefined";

export const useAuthPersistStore = create<AuthPersistStore>()(
  persist(
    (set) => {
      _set = set;

      return {
        ...authPersistStore,
        isReady: false,

        setAccessToken: (token) => set({ accessToken: token }),
        setRefreshToken: (token) => set({ refreshToken: token }),
        setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
        logout: () =>
          set({
            ...authPersistStore,
            isReady: true,
          }),
      };
    },
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        isClient
          ? require("@react-native-async-storage/async-storage").default
          : undefined
      ),
      onRehydrateStorage: () => {
        return () => {
          _set({ isReady: true });
        };
      },
    }
  )
);
