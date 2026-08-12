import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PreferencePersistData {
  language: "en" | "fr" | "ar" | "system";
  theme: "dark" | "light" | "system";
}

interface PreferencePersistStore extends PreferencePersistData {
  isReady: boolean;
  setTheme: (theme: "dark" | "light" | "system") => void;
  setLanguage: (language: "en" | "fr" | "ar" | "system") => void;
  toggleTheme: () => void;
}

const preferencePersistStore: PreferencePersistData = {
  language: "system",
  theme: "system",
};

let _set: (fn: Partial<PreferencePersistStore>) => void;

const isClient = typeof window !== "undefined";

export const usePreferencePersistStore = create<PreferencePersistStore>()(
  persist(
    (set, get) => {
      _set = set;

      return {
        ...preferencePersistStore,
        isReady: false,

        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === "light" ? "dark" : "light",
          })),
      };
    },
    {
      name: "preference-storage",
      storage: createJSONStorage(() =>
        isClient
          ? require("@react-native-async-storage/async-storage").default
          : undefined,
      ),
      onRehydrateStorage: () => {
        return () => {
          _set({ isReady: true });
        };
      },
    },
  ),
);
