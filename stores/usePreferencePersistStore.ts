import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PreferencePersistData {
  language: "en" | "fr" | "ar";
  theme: "dark" | "light";
}

interface PreferencePersistStore extends PreferencePersistData {
  isReady: boolean;
  setTheme: (theme: "dark" | "light") => void;
  setLanguage: (language: "en" | "fr" | "ar") => void;
  toggleTheme: () => void;
}

const preferencePersistStore: PreferencePersistData = {
  language: "en",
  theme: "light",
};

let _set: (fn: Partial<PreferencePersistStore>) => void;

export const usePreferencePersistStore = create<PreferencePersistStore>()(
  persist(
    (set, get) => {
      _set = set;

      return {
        ...preferencePersistStore,
        isReady: false,
        setTheme: (theme) =>
          set((state) => ({
            ...state,
            theme,
          })),
        setLanguage: (language) =>
          set((state) => ({
            ...state,
            language,
          })),
        toggleTheme: () =>
          set((state) => ({
            ...state,
            theme: state.theme === "light" ? "dark" : "light",
          })),
      };
    },

    {
      name: "preference-storage",
      storage: createJSONStorage(() => AsyncStorage),

      onRehydrateStorage: () => {
        return () => {
          _set({ isReady: true });
        };
      },
    }
  )
);
