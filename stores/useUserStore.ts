import { setDeepValue } from "@/lib/object";
import { create } from "zustand";
import {
  ResponseEducationDto,
  ResponseExperienceDto,
  ResponseUserDto,
  UpdateEducationDto,
  UpdateExperienceDto,
  UpdateUserDto,
} from "~/types";

interface UserData {
  response?: ResponseUserDto;
  updateDto: UpdateUserDto;

  //experiences
  experiences?: ResponseExperienceDto[];
  updateExperienceDto: UpdateExperienceDto;

  //educations
  educations?: ResponseEducationDto[];
  updateEducationDto: UpdateEducationDto;

  //utils
  picture?: string;
  progress: number;

  //errors
  errors: Record<string, string[]>;
}

export interface UserStore extends UserData {
  set: <K extends keyof UserData>(name: K, value: UserData[K]) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
}

const initialState: UserData = {
  response: undefined,
  updateDto: {
    firstName: "",
    lastName: "",
    dateOfBirth: new Date(),
    isActive: true,
    password: "",
    email: "",
    phone: "",
    cin: "",
    bio: "",
    gender: undefined,
    isPrivate: true,
  },
  updateExperienceDto: {
    title: "",
    company: "",
    startDate: new Date(),
    endDate: new Date(),
    description: "",
  },
  updateEducationDto: {
    title: "",
    institution: "",
    startDate: new Date(),
    endDate: new Date(),
    description: "",
  },
  picture: undefined,
  progress: 0,
  errors: {},
};

export const useUserStore = create<UserStore>((set, get) => ({
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
      const rootValue = state[rootKey as keyof UserData];
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
}));

export const createClientStore = () =>
  create<UserStore>((set) => ({
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
        const rootValue = state[rootKey as keyof UserData];
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
  }));
