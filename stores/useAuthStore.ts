import { setDeepValue } from "@/lib/object";
import { RequestClientSignInDto, RequestClientSignUpDto } from "@/types";
import { create } from "zustand";

interface AuthData {
  signInRequest: RequestClientSignInDto;
  signUpRequest: RequestClientSignUpDto;
  utilities: {
    confirmPassword: string;
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
  },
  utilities: {
    confirmPassword: "",
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
  setNested: (path, value) => {
    const [rootKey, ...restPath] = path.split(".");
    const nestedPath = restPath.join(".");
    set((state) => {
      const updatedRoot = setDeepValue(
        { ...state[rootKey as keyof AuthData] },
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
  resetErrors: () => {
    set((state) => ({
      ...state,
      errors: {},
    }));
  },
}));
