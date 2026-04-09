import { setDeepValue } from "@/lib/object";
import {
  CreateSessionDto,
  MapSessionPayload,
  SessionType,
} from "@/types/session";
import { create } from "zustand";

interface SessionData {
  createDto: CreateSessionDto<MapSessionPayload>;
  flags: {
    startNow: boolean;
  };
  //errors
  errors: Record<string, any>;
}

export interface SessionStore extends SessionData {
  set: <K extends keyof SessionData>(name: K, value: SessionData[K]) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
}

const initialState: SessionData = {
  createDto: {
    sessionType: SessionType.MAP_SESSION,
    payload: {
      objectives: [],
    },
    plannedStart: undefined,
    plannedEnd: undefined,
  },

  flags: {
    startNow: true,
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
  setNested: (path, value) => {
    const [rootKey, ...restPath] = path.split(".");
    const nestedPath = restPath.join(".");
    set((state) => {
      const updatedRoot = setDeepValue(
        { ...state[rootKey as keyof SessionData] },
        nestedPath,
        value,
      );
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
