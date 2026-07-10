import { setDeepValue } from "@/lib/object";
import {
  RequestClientSignInDto,
  RequestSpecializedClientSignUpDto,
} from "@/types";
import { create } from "zustand";

interface AuthData {
  signInRequest: RequestClientSignInDto;
  signUpRequest: RequestSpecializedClientSignUpDto;
  utilities: {
    confirmPassword: string;
    picture?: string;
    progress: number;
    acceptedTerms: boolean;
  };
  signUpRequestErrors: Record<string, string[]>;
  signInRequestErrors: Record<string, string[]>;
}

export interface AuthStore extends AuthData {
  set: <K extends keyof AuthData>(name: K, value: AuthData[K]) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
  resetErrors: () => void;
}

const initialState: AuthData = {
  signInRequest: {
    email: "",
    password: "",
  },
  signUpRequest: {
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    industries: [],
    pictureId: undefined,
  },
  utilities: {
    confirmPassword: "",
    picture: undefined,
    progress: 0,
    acceptedTerms: false,
  },
  signInRequestErrors: {},
  signUpRequestErrors: {},
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,
  set: (name, value) => {
    set((state) => ({
      ...state,
      [name]: value,
    }));
  },
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
      const rootValue = state[rootKey as keyof AuthData];
      if (typeof rootValue !== "object" || rootValue === null) {
        throw new Error(`Cannot set nested path on non-object: ${rootKey}`);
      }

      const updatedRoot = setDeepValue(
        { ...(rootValue as object) },
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
  resetErrors: () => {
    set((state) => ({
      ...state,
      errors: {},
    }));
  },
}));
