import { setDeepValue } from "@/lib/object";
import { create } from "zustand";
import {
  ResponseClientDto,
  ResponseFollowCountsDto,
  ResponseFollowDto,
  UpdateClientDto,
} from "~/types";

interface ClientData {
  response?: ResponseClientDto;
  responseFollowCountsDto: ResponseFollowCountsDto;
  followers: ResponseFollowDto[];
  followings: ResponseFollowDto[];
  updateDto: UpdateClientDto;
  picture?: string;
  progress: number;
  errors: Record<string, string[]>;
}

export interface ClientStore extends ClientData {
  set: <K extends keyof ClientData>(name: K, value: ClientData[K]) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
}

const initialState: ClientData = {
  response: undefined,
  responseFollowCountsDto: {
    followers: 0,
    following: 0,
  },
  followers: [],
  followings: [],
  updateDto: {
    firstName: "",
    lastName: "",
    dateOfBirth: new Date(),
    isActive: true,
    password: "",
    email: "",
    profile: {
      phone: "",
      cin: "",
      bio: "",
      gender: undefined,
      isPrivate: true,
    },
  },
  picture: undefined,
  progress: 0,
  errors: {},
};

export const useClientStore = create<ClientStore>((set, get) => ({
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
      const rootValue = state[rootKey as keyof ClientData];
      if (typeof rootValue !== "object" || rootValue === null) {
        throw new Error(`Cannot set nested path on non-object: ${rootKey}`);
      }

      const updatedRoot = setDeepValue(
        { ...(rootValue as object) },
        nestedPath,
        value
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

export const createClientStore = () =>
  create<ClientStore>((set) => ({
    ...initialState,
    set: (name, value) =>
      set((state) => ({
        ...state,
        [name]: value,
      })),
    setNested: (path: string, value: unknown) => {
      if (!path.includes(".")) {
        set((state) => ({
          ...state,
          [path]: value,
        }));
        return;
      }

      const [rootKey, ...restPath] = path.split(".");
      const nestedPath = restPath.join(".");

      set((state) => {
        const rootValue = state[rootKey as keyof ClientData];
        if (typeof rootValue !== "object" || rootValue === null) {
          throw new Error(`Cannot set nested path on non-object: ${rootKey}`);
        }

        const updatedRoot = setDeepValue(
          { ...(rootValue as object) },
          nestedPath,
          value
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
