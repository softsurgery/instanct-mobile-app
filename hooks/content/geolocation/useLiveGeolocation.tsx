import { api } from "@/api";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { disconnectSocket, getSocket } from "@/lib/socket";
import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser } from "@/types";
import * as Location from "expo-location";
import React from "react";
import { Socket } from "socket.io-client";

interface UseLiveGeolocationOptions {}

export function useLiveGeolocation({}: UseLiveGeolocationOptions) {
  const apiUrl =
    process.env.EXPO_PUBLIC_API_SOCKET_URL || "http://localhost:8080";
  const { accessToken } = useAuthPersistStore();
  const [restartCount, setRestartCount] = React.useState(0);

  // Use selectors to avoid re-renders when unrelated store parts change
  const radiusKm = useMapStore((state) => state.paramaters.radiusKm);
  const updateInterval = useMapStore(
    (state) => state.paramaters.updateInterval,
  );
  const setLocation = useMapStore((state) => state.set);
  const setNearbyUsers = useMapStore((state) => state.setNearbyUsers);
  const updateNearbyUser = useMapStore((state) => state.updateNearbyUser);
  const getUserById = useMapStore((state) => state.getUserById);
  const addUser = useMapStore((state) => state.addUser);
  const setNested = useMapStore((state) => state.setNested);

  const socketRef = React.useRef<Socket | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const radiusKmRef = React.useRef(radiusKm);

  // Keep ref in sync for use in callbacks without triggering re-renders
  React.useEffect(() => {
    radiusKmRef.current = radiusKm;
  }, [radiusKm]);

  const updateLocation = React.useCallback(
    async (socket?: Socket) => {
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLocation("location", pos);

        (socket ?? socketRef.current)?.emit("update_location", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          radius: radiusKmRef.current,
        });
      } catch (err) {
        console.warn("⚠️ Failed to fetch location:", err);
      }
    },
    [setLocation],
  );

  const initializeSocket = React.useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("❌ Location permission denied");
      return;
    }

    const socket = getSocket("geolocation", apiUrl, {
      token: accessToken,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    /** 🟢 Connected */
    socket.on("connect", async () => {
      socket.emit("identify");
      setLocation("connected", true);
      setLocation("loading", false);
      setLocation("reconnection", {
        reconnecting: false,
        reconnectAttempt: 0,
        reconnectDelay: 0,
      });
      await updateLocation(socket);
    });

    /** 🔴 Disconnected */
    socket.on("disconnect", () => {});

    /** 🔁 Reconnection lifecycle */
    socket.io.on("reconnect_attempt", (attempt: number) => {
      const delay = Math.min(2000 * Math.pow(1.5, attempt - 1), 10000);
      // console.log(`🔁 Reconnect attempt #${attempt} (next in ~${delay}ms)`);
      setLocation("reconnection", {
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
      setNested("reconnection.reconnecting", false);
    });

    socket.io.on("reconnect", async (attempt: number) => {
      // console.log(`✅ Successfully reconnected after ${attempt} attempts`);
      setLocation("connected", true);
      setLocation("reconnection", {
        reconnecting: false,
        reconnectAttempt: attempt,
        reconnectDelay: 0,
      });
      await updateLocation(socket);
    });

    socket.on("nearby_users", async (nearbyList: NearbyUser[]) => {
      setNearbyUsers(nearbyList);

      // fetch profiles for all nearby users (lazy)
      for (const n of nearbyList) {
        const existing = getUserById(n.userId);
        if (!existing) {
          try {
            const profile = await api.user.findById(n.userId);
            addUser(profile); // prevents duplicates
          } catch (e) {
            console.warn("Failed to fetch profile:", e);
          }
        }
      }
    });

    socket.on("user_moved", async (data: NearbyUser) => {
      updateNearbyUser(data);

      const existing = getUserById(data.userId);
      if (!existing) {
        try {
          const profile = await api.user.findById(data.userId);
          addUser(profile);
        } catch (e) {
          console.warn("❌ Failed retrieving user", e);
        }
      }
    });

    await updateLocation(socket);
    intervalRef.current = setInterval(
      () => updateLocation(socket),
      updateInterval * 1000,
    );
  }, [
    accessToken,
    apiUrl,
    updateLocation,
    setLocation,
    setNested,
    setNearbyUsers,
    getUserById,
    addUser,
    updateNearbyUser,
    updateInterval,
  ]);

  // Use selectors for return values to avoid re-renders
  const connected = useMapStore((state) => state.connected);
  const loading = useMapStore((state) => state.loading);
  const reconnection = useMapStore((state) => state.reconnection);
  const nearbyUsers = useMapStore((state) => state.nearbyUsers);
  const users = useMapStore((state) => state.users);
  const location = useMapStore((state) => state.location);

  React.useEffect(() => {
    initializeSocket();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      disconnectSocket("geolocation");
      socketRef.current = null;
    };
  }, [initializeSocket, restartCount]);

  const restartSocket = React.useCallback(() => {
    setRestartCount((c) => c + 1);
  }, []);

  return {
    connected,
    loading,
    reconnection,
    nearbyUsers,
    users,
    location,
    restartSocket,
  };
}
