import { setDeepValue } from "@/lib/object";
import { CreateSessionDto, SessionType } from "@/types/session";
import { create } from "zustand";

interface SessionData {
  createDto: CreateSessionDto;

  //errors
  errors: Record<string, string[]>;
}

export interface SessionStore extends SessionData {
  set: <K extends keyof SessionData>(name: K, value: SessionData[K]) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
}

const initialState: SessionData = {
  createDto: {
    sessionType: SessionType.MAP_SESSION,
    payload: {},
    plannedStart: undefined,
    plannedEnd: undefined,
  },

  errors: {},
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...initialState,
  set: (name, value) => {
    set((state) => ({
      ...state,
      [name]: value,
    }));
  },
  setNested: (path: string, value: unknown) => {
    if (!path.includes(".")) {
      // No nesting — set directly
      set((state) => ({
        ...state,
        [path]: value,
      }));
      return;
    }

    // Nested path case
    const [rootKey, ...restPath] = path.split(".");
    const nestedPath = restPath.join(".");

    set((state) => {
      const rootValue = state[rootKey as keyof SessionData];
      if (typeof rootValue !== "object" || rootValue === null) {
        throw new Error(`Cannot set nested path on non-object: ${rootKey}`);
      }

      const updatedRoot = setDeepValue(rootValue, nestedPath, value);

      return {
        ...state,
        [rootKey]: updatedRoot,
      };
    });
  },
  reset: () => {
    set({ ...initialState });
  },
}));
