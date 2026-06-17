import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { disconnectSocket, getSocket } from "@/lib/socket";
import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser } from "@/types";
import * as Location from "expo-location";
import React from "react";
import { Socket } from "socket.io-client";
import { useShallow } from "zustand/react/shallow";
import { useLiveGeolocationParameters } from "./useLiveGeolocationParamters";

interface useLiveGeolocationOptions {
  enabled?: boolean; // reserved for future use
  join: string[];
}

export function useLiveGeolocation(
  { enabled, join }: useLiveGeolocationOptions = {
    enabled: true,
    join: [],
  },
) {
  const { refetchMapConfiguration } = useLiveGeolocationParameters();

  const { accessToken } = useAuthPersistStore();

  // Subscribe only to the specific slices needed for rendering / effect deps
  const connected = useMapStore((s) => s.connected);
  const loading = useMapStore((s) => s.loading);
  const reconnection = useMapStore((s) => s.reconnection);
  const location = useMapStore((s) => s.location);
  const restartSignal = useMapStore((s) => s.restartSignal);
  const hasInitializedParameters = useMapStore(
    (s) => s.hasInitializedParameters,
  );

  // Use shallow comparison for arrays to avoid re-renders when content hasn't changed
  const nearbyUsers = useMapStore(useShallow((s) => s.nearbyUsers));
  const users = useMapStore(useShallow((s) => s.users));

  const socketRef = React.useRef<Socket | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const listenerSetupDoneRef = React.useRef(false);

  // Keep `join` in a ref so the callback doesn't depend on it
  const joinRef = React.useRef(join);
  React.useEffect(() => {
    joinRef.current = join;
  }, [join]);

  const updateLocation = React.useCallback(async (socket?: Socket) => {
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      useMapStore.getState().set("location", pos);

      const radius = useMapStore.getState().settings?.radius;

      if (radius == null) {
        console.warn("⚠️ radius not initialized yet");
        return;
      }

      socket?.emit("update_location", {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        radius,
        query: { join: joinRef.current.join(",") },
      });
    } catch (err) {
      console.warn("⚠️ Failed to fetch location:", err);
    }
  }, []);

  const initializeSocket = React.useCallback(async () => {
    // Skip if already initialized
    if (socketRef.current && listenerSetupDoneRef.current) {
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("❌ Location permission denied");
      return;
    }

    const socket = getSocket("geolocation", {
      token: accessToken,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    // Only set up listeners once
    if (!listenerSetupDoneRef.current) {
      listenerSetupDoneRef.current = true;

      /** 🟢 Connected */
      socket.on("connect", async () => {
        const store = useMapStore.getState();
        socket.emit("identify");
        store.set("connected", true);
        store.set("loading", false);
        store.set("reconnection", {
          reconnecting: false,
          reconnectAttempt: 0,
          reconnectDelay: 0,
        });
        await updateLocation(socket);
      });

      /** 🔴 Disconnected */
      socket.on("disconnect", () => {
        useMapStore.getState().set("connected", false);
      });

      /** 🔁 Reconnection lifecycle */
      socket.io.on("reconnect_attempt", (attempt: number) => {
        const delay = Math.min(2000 * Math.pow(1.5, attempt - 1), 10000);
        useMapStore.getState().set("reconnection", {
          reconnecting: true,
          reconnectAttempt: attempt,
          reconnectDelay: delay,
        });
      });

      socket.io.on("reconnect_error", (err: Error) => {
        // console.log("⚠️ Reconnect error:", err.message);
      });

      socket.io.on("reconnect_failed", () => {
        console.warn("❌ Reconnect failed — will retry automatically");
        useMapStore.getState().setNested("reconnection.reconnecting", false);
      });

      socket.io.on("reconnect", async (attempt: number) => {
        const store = useMapStore.getState();
        store.set("connected", true);
        store.set("reconnection", {
          reconnecting: false,
          reconnectAttempt: attempt,
          reconnectDelay: 0,
        });
        await updateLocation(socket);
      });

      socket.on("nearby_users", async (nearbyList: NearbyUser[]) => {
        const store = useMapStore.getState();
        store.setNearbyUsers(nearbyList);

        // fetch profiles for all nearby users
        for (const n of nearbyList) {
          try {
            if (n.user) useMapStore.getState().addUser(n.user);
          } catch (e) {
            console.warn("Failed to fetch profile:", e);
          }
        }
      });

      socket.on("user_moved", async (data: NearbyUser) => {
        const store = useMapStore.getState();
        store.updateNearbyUser(data);

        const existing = store.getUserById(data.userId);
        try {
          if (!existing && data.user) store.addUser(data.user);
        } catch (e) {
          console.warn("❌ Failed retrieving user", e);
        }
      });
    }

    await updateLocation(socket);
    if (!intervalRef.current) {
      const updateInterval =
        useMapStore.getState().parameters.updateInterval * 1000;
      intervalRef.current = setInterval(
        async () => await updateLocation(socket),
        updateInterval,
      );
    }
  }, [accessToken, updateLocation]);

  React.useEffect(() => {
    if (!enabled) return;
    if (!hasInitializedParameters) return;

    initializeSocket();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      disconnectSocket("geolocation");
      socketRef.current = null;
      listenerSetupDoneRef.current = false;
    };
  }, [enabled, initializeSocket, restartSignal, hasInitializedParameters]);

  const restartSocket = React.useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    disconnectSocket("geolocation");
    socketRef.current = null;
    listenerSetupDoneRef.current = false;

    const store = useMapStore.getState();
    store.restart();
    store.triggerRestart();
  }, []);

  return {
    connected,
    loading,
    reconnection,
    nearbyUsers,
    users,
    location,
    restartSocket,
    refetchMapConfiguration,
  };
}
