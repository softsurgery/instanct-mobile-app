import { setDeepValue } from "@/lib/object";
import { NearbyUser, ResponseClientDto } from "@/types";
import * as Location from "expo-location";
import { create } from "zustand";

interface MapData {
  connected: boolean;
  location: Location.LocationObject | null;
  users: ResponseClientDto[];
  nearbyUsers: NearbyUser[];
  reconnection: {
    reconnecting: boolean;
    reconnectAttempt: number;
    reconnectDelay: number;
  };
  loading: boolean;
}

interface MapStore extends MapData {
  set: <K extends keyof MapData>(name: K, value: MapData[K]) => void;
  setNested: <T>(path: string, value: T) => void;
  setNearbyUsers: (prev: NearbyUser[]) => void;
  updateNearbyUser: (data: NearbyUser) => void;
  getUserById: (id: string) => ResponseClientDto | null;
  reset: () => void;
}

const initialState: MapData = {
  connected: false,
  location: null,
  users: [],
  nearbyUsers: [],
  reconnection: {
    reconnecting: false,
    reconnectAttempt: 0,
    reconnectDelay: 0,
  },
  loading: true,
};

export const useMapStore = create<MapStore>((set, get) => ({
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
      const rootValue = state[rootKey as keyof MapData];
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
  setNearbyUsers: (users: NearbyUser[]) => {
    set((state) => {
      const updated = [...state.nearbyUsers];

      for (const newUser of users) {
        const index = updated.findIndex((u) => u.userId === newUser.userId);
        if (index !== -1) {
          updated[index] = { ...updated[index], ...newUser };
        } else {
          updated.push(newUser);
        }
      }

      return { ...state, nearbyUsers: updated };
    });
  },
  updateNearbyUser: (data: NearbyUser) => {
    set((state) => {
      const index = state.nearbyUsers.findIndex(
        (u) => u.userId === data.userId
      );
      if (index !== -1) {
        const copy = [...state.nearbyUsers];
        copy[index] = { ...copy[index], ...data };
        return { ...state, nearbyUsers: copy };
      }
      return { ...state, nearbyUsers: [...state.nearbyUsers, data] };
    });
  },
  getUserById: (id: string) => {
    return get().users.find((u) => u.id === id) ?? null;
  },
  reset: () => {
    set({ ...initialState });
  },
}));
