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
  //common
  set: <K extends keyof MapData>(name: K, value: MapData[K]) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
  //additional
  addNearbyUser: (user: NearbyUser) => void;
  addUser: (user: ResponseClientDto) => void;

  setNearbyUsers: (prev: NearbyUser[]) => void;
  setUsers: (prev: ResponseClientDto[]) => void;
  updateNearbyUser: (data: NearbyUser) => void;

  getUserById: (id: string) => ResponseClientDto | null;
  getNearbyUserById: (id: string) => NearbyUser | null;
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
  addNearbyUser: (user: NearbyUser) => {
    set((state) => {
      const existing = state.nearbyUsers.find((u) => u.userId === user.userId);
      if (existing) return state;
      const updated = [...state.nearbyUsers];
      updated.push(user);
      return { ...state, nearbyUsers: updated };
    });
  },
  addUser: (user: ResponseClientDto) => {
    set((state) => {
      const existing = state.users.find((u) => u.id === user.id);
      if (existing) return state;
      const updated = [...state.users];
      updated.push(user);
      return { ...state, users: updated };
    });
  },
  setUsers: (users: ResponseClientDto[]) => {
    set((state) => {
      const updated = [...state.users];

      for (const newUser of users) {
        const index = updated.findIndex((u) => u.id === newUser.id);
        if (index !== -1) {
          updated[index] = { ...updated[index], ...newUser };
        } else {
          updated.push(newUser);
        }
      }

      return { ...state, users: updated };
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
      const existing = state.nearbyUsers.find((u) => u.userId === data.userId);

      if (
        existing &&
        existing.updatedAt &&
        data.updatedAt &&
        data.updatedAt < existing.updatedAt
      ) {
        return state;
      }

      const copy = [...state.nearbyUsers];
      const index = copy.findIndex((u) => u.userId === data.userId);

      if (index !== -1) {
        copy[index] = { ...copy[index], ...data };
      } else {
        copy.push(data);
      }

      return { ...state, nearbyUsers: copy };
    });
  },
  getUserById: (id: string) => {
    return get().users.find((u) => u.id === id) ?? null;
  },
  getNearbyUserById: (id: string) => {
    return get().nearbyUsers.find((u) => u.userId === id) ?? null;
  },
  reset: () => {
    set({ ...initialState });
  },
}));
