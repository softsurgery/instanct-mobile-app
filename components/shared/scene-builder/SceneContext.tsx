import React from "react";
import { DynamicScene } from "./types";

export interface SceneContextProps {
  scenes: Record<string, DynamicScene | undefined>;
  setScenes: React.Dispatch<
    React.SetStateAction<Record<string, DynamicScene | undefined>>
  >;
  push: (id: string, scene: DynamicScene) => void;
  pop: (id: string) => void;
}

export const SceneContext = React.createContext<Partial<SceneContextProps>>({});

interface SceneProviderProps {
  value: {
    scenes: Record<string, DynamicScene | undefined>;
    setScenes: React.Dispatch<
      React.SetStateAction<Record<string, DynamicScene | undefined>>
    >;
  };
  children: React.ReactNode;
}

export const SceneProvider = ({ value, children }: SceneProviderProps) => {
  const { scenes, setScenes } = value;

  const push = React.useCallback(
    (id: string, scene: DynamicScene) => {
      setScenes((prev) => ({
        ...prev,
        [id]: scene,
      }));
    },
    [setScenes]
  );

  const pop = React.useCallback(
    (id: string) => {
      setScenes((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    },
    [setScenes]
  );

  return (
    <SceneContext.Provider
      value={{
        scenes,
        setScenes,
        push,
        pop,
      }}
    >
      {children}
    </SceneContext.Provider>
  );
};

export const useSceneContext = () => React.useContext(SceneContext);
