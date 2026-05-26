import { setDeepValue } from "@/lib/object";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Filter {
  objectives: number[];
  industry: number[];
}

export interface ExploreFilterData {
  dto: Filter;
  filters: Filter;
}

export interface ExploreFilterStore extends ExploreFilterData {
  set: <K extends keyof ExploreFilterData>(
    name: K,
    value: ExploreFilterData[K],
  ) => void;
  setNested: (path: string, value: unknown) => void;
  apply: () => void;
  getFilterExpression: () => string[];
  resetDto: () => void;
  reset: () => void;
}

const emptyFilter: Filter = {
  objectives: [],
  industry: [],
};

const initialState: ExploreFilterData = {
  dto: structuredClone(emptyFilter),
  filters: structuredClone(emptyFilter),
};

export const useExploreFilterStore = create<ExploreFilterStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      set: (name, value) =>
        set((state) => ({
          dto: {
            ...state.dto,
            [name]: value,
          },
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
          const rootValue = state[rootKey as keyof ExploreFilterStore];
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
      apply: () =>
        set((state) => ({
          filters: state.dto,
        })),

      resetDto: () =>
        set((state) => ({
          ...state,
          dto: structuredClone(state.filters),
        })),

      reset: () => {
        set({ ...initialState });
      },

      getFilterExpression: () => {
        const state = get();

        const filters: string[] = [];

        return filters;
      },
    }),
    {
      name: "explore-filter-store",
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        dto: state.dto,
        filters: state.filters,
      }),
    },
  ),
);
