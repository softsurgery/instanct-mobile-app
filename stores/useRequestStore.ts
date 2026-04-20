import { setDeepValue } from "@/lib/object";
import { create } from "zustand";
import { CreateRequestDto } from "~/types";

interface RequestData {
  createDto: CreateRequestDto;

  flags: {
    initialLocationSet: boolean;
    location: {
      latitude: number;
      longitude: number;
    };
    mentionTimeAndPlace: boolean;
  };
  errors: Record<string, string[]>;
}

export interface RequestStore extends RequestData {
  set: <K extends keyof RequestData>(name: K, value: RequestData[K]) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
}

const initialState: RequestData = {
  createDto: {
    receiverIds: [],
    message: "",
    location: undefined,
    time: undefined,
  },
  flags: {
    initialLocationSet: false,
    location: {
      latitude: 0,
      longitude: 0,
    },
    mentionTimeAndPlace: false,
  },
  errors: {},
};

export const useRequestStore = create<RequestStore>((set, get) => ({
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
        { ...state[rootKey as keyof RequestData] },
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
