import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // keep cache for 24h
    },
  },
});

const safeAsyncStorage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn("Failed to get cache, clearing it", e);
      try {
        await AsyncStorage.removeItem(key);
      } catch {}
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // Limit to ~1.5MB to avoid Android CursorWindow crash (2MB limit)
      if (value.length > 1.5 * 1024 * 1024) {
        try {
          await AsyncStorage.removeItem(key);
        } catch {}
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn("Failed to set cache", e);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn("Failed to remove cache", e);
    }
  },
};

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: safeAsyncStorage,
  key: "REACT_QUERY_CACHE",
  throttleTime: 1000,
});
