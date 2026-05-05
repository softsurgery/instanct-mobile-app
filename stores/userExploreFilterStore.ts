import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ExploreFilterData {
  objectives: number[];
  industry: number[];
}

export interface ExploreFilterStore {
  dto: ExploreFilterData;
  initialState: ExploreFilterData;
  // Store methods
  set: <K extends keyof ExploreFilterData>(
    name: K,
    value: ExploreFilterData[K],
  ) => void;
  apply: () => void;
  reset: () => void;
  setInitialState: (newInitialState: ExploreFilterData) => void;
}

const initialState: ExploreFilterData = {
  objectives: [],
  industry: [],
};

export const useExploreFilterStore = create<ExploreFilterStore>()(
  persist(
    (set) => ({
      dto: initialState,
      initialState: initialState,

      set: (name, value) =>
        set((state) => ({
          dto: {
            ...state.dto,
            [name]: value,
          },
        })),

      apply: () =>
        set((state) => ({
          initialState: state.dto,
        })),

      reset: () =>
        set((state) => ({
          dto: state.initialState,
        })),

      setInitialState: (newInitialState) =>
        set({
          initialState: newInitialState,
          dto: newInitialState,
        }),
    }),
    {
      name: "explore-filter-store", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist dto and initialState, not methods
      partialize: (state) => ({
        dto: state.dto,
      }),
    },
  ),
);
