import { create } from "zustand";
import { DynamicScene } from "./types";

export interface SceneStore {
  scenes: Record<string, DynamicScene | undefined>;
  setScenes: (
    updater:
      | Record<string, DynamicScene | undefined>
      | ((
          prev: Record<string, DynamicScene | undefined>,
        ) => Record<string, DynamicScene | undefined>),
  ) => void;
  push: (id: string, scene: DynamicScene) => void;
  pop: (id: string) => void;
}

export const useSceneBuilderStore = create<SceneStore>((set) => ({
  scenes: {},

  setScenes: (updater) =>
    set((state) => ({
      scenes: typeof updater === "function" ? updater(state.scenes) : updater,
    })),

  push: (id, scene) =>
    set((state) => ({
      scenes: {
        ...state.scenes,
        [id]: scene,
      },
    })),

  pop: (id) =>
    set((state) => {
      const copy = { ...state.scenes };
      delete copy[id];
      return { scenes: copy };
    }),
}));
