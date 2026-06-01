import { setDeepValue } from "@/lib/object";
import { Cluster, NearbyUser, ResponseUserDto } from "@/types";
import * as Location from "expo-location";
import { create } from "zustand";
import isEqual from "lodash/isEqual";

interface MapData {
  parameters: {
    radius: number;
    rangeMin: number;
    rangeMax: number;
    updateInterval: number;
  };
  settings: {
    radius: number;
    showUsernames: boolean;
    clusters: boolean;
    mode: "sattelite" | "map";
  };
  draftSettings: {
    radius: number;
    showUsernames: boolean;
    clusters: boolean;
    mode: "sattelite" | "map";
  };
  hasInitializedParameters: boolean;
  connected: boolean;
  location: Location.LocationObject | null;
  users: ResponseUserDto[];
  nearbyUsers: NearbyUser[];
  clusters: Cluster[];
  reconnection: {
    reconnecting: boolean;
    reconnectAttempt: number;
    reconnectDelay: number;
  };
  loading: boolean;
  restartSignal: number;
}

interface MapStore extends MapData {
  //common
  set: <K extends keyof MapData>(name: K, value: MapData[K]) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
  triggerRestart: () => void;
  //additional
  addNearbyUser: (user: NearbyUser) => void;
  addUser: (user: ResponseUserDto) => void;

  setNearbyUsers: (prev: NearbyUser[]) => void;
  setUsers: (prev: ResponseUserDto[]) => void;
  updateNearbyUser: (data: NearbyUser) => void;

  getUserById: (id: string) => ResponseUserDto | null;
  getNearbyUserById: (id: string) => NearbyUser | null;

  restart: () => void;
}

const initialState: MapData = {
  parameters: {
    radius: 50,
    rangeMax: 100,
    rangeMin: 0,
    updateInterval: 5,
  },
  settings: {
    radius: 50,
    showUsernames: true,
    clusters: true,
    mode: "map",
  },
  draftSettings: {
    radius: 50,
    showUsernames: true,
    clusters: true,
    mode: "map",
  },
  hasInitializedParameters: false,
  connected: false,
  location: null,
  users: [],
  nearbyUsers: [],
  clusters: [],
  reconnection: {
    reconnecting: false,
    reconnectAttempt: 0,
    reconnectDelay: 0,
  },
  loading: true,
  restartSignal: 0,
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
        value,
      );

      return {
        ...state,
        [rootKey]: updatedRoot,
      };
    });
  },

  addUser: (user: ResponseUserDto) => {
    set((state) => {
      const existing = state.users.find((u) => u.id === user.id);

      // Add new user
      if (!existing) {
        return {
          ...state,
          users: [...state.users, user],
        };
      }

      // No changes
      if (isEqual(existing, user)) {
        return state;
      }

      // Replace changed user
      return {
        ...state,
        users: state.users.map((u) => (u.id === user.id ? user : u)),
      };
    });
  },

  addNearbyUser: (user: NearbyUser) => {
    set((state) => {
      const existing = state.nearbyUsers.find((u) => u.userId === user.userId);

      if (!existing) {
        return {
          ...state,
          nearbyUsers: [...state.nearbyUsers, user],
        };
      }

      if (isEqual(existing, user)) {
        return state;
      }

      return {
        ...state,
        nearbyUsers: state.nearbyUsers.map((u) =>
          u.userId === user.userId ? user : u,
        ),
      };
    });
  },

  setUsers: (users: ResponseUserDto[]) => {
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
  restart: () => {
    set({
      nearbyUsers: [],
      users: [],
      clusters: [],
      connected: false,
    });
  },
  triggerRestart: () => {
    set((state) => ({ restartSignal: state.restartSignal + 1 }));
  },
  reset: () => {
    set({ ...initialState });
  },
}));
