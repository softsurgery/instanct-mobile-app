import { api } from "@/api";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { disconnectSocket, getSocket } from "@/lib/socket";
import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser } from "@/types";
import * as Location from "expo-location";
import React from "react";
import { Socket } from "socket.io-client";

interface useLiveGeolocationOptions {}

export function useLiveGeolocation({}: useLiveGeolocationOptions = {}) {
  const apiUrl =
    process.env.EXPO_PUBLIC_API_SOCKET_URL || "http://localhost:8080";
  const { accessToken } = useAuthPersistStore();
  const [restartCount, setRestartCount] = React.useState(0);

  const mapStore = useMapStore();

  const socketRef = React.useRef<Socket | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const radiusRef = React.useRef(mapStore.parameters.radius);
  const listenerSetupDoneRef = React.useRef(false);

  // Keep ref in sync for use in callbacks without triggering re-renders
  React.useEffect(() => {
    radiusRef.current = mapStore.parameters.radius;
  }, [mapStore.parameters.radius]);

  const updateLocation = React.useCallback(async (socket?: Socket) => {
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      mapStore.set("location", pos);

      (socket ?? socketRef.current)?.emit("update_location", {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        radius: radiusRef.current,
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

    const socket = getSocket("geolocation", apiUrl, {
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
        socket.emit("identify");
        mapStore.set("connected", true);
        mapStore.set("loading", false);
        mapStore.set("reconnection", {
          reconnecting: false,
          reconnectAttempt: 0,
          reconnectDelay: 0,
        });
        await updateLocation(socket);
      });

      /** 🔴 Disconnected */
      socket.on("disconnect", () => {
        mapStore.set("connected", false);
      });

      /** 🔁 Reconnection lifecycle */
      socket.io.on("reconnect_attempt", (attempt: number) => {
        const delay = Math.min(2000 * Math.pow(1.5, attempt - 1), 10000);
        mapStore.set("reconnection", {
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
        mapStore.setNested("reconnection.reconnecting", false);
      });

      socket.io.on("reconnect", async (attempt: number) => {
        mapStore.set("connected", true);
        mapStore.set("reconnection", {
          reconnecting: false,
          reconnectAttempt: attempt,
          reconnectDelay: 0,
        });
        await updateLocation(socket);
      });

      socket.on("nearby_users", async (nearbyList: NearbyUser[]) => {
        mapStore.setNearbyUsers(nearbyList);

        // fetch profiles for all nearby users (lazy)
        for (const n of nearbyList) {
          const existing = mapStore.getUserById(n.userId);
          if (!existing) {
            try {
              const profile = await api.user.findById(n.userId);
              mapStore.addUser(profile); // prevents duplicates
            } catch (e) {
              console.warn("Failed to fetch profile:", e);
            }
          }
        }
      });

      socket.on("user_moved", async (data: NearbyUser) => {
        mapStore.updateNearbyUser(data);

        const existing = mapStore.getUserById(data.userId);
        if (!existing) {
          try {
            const profile = await api.user.findById(data.userId);
            mapStore.addUser(profile);
          } catch (e) {
            console.warn("❌ Failed retrieving user", e);
          }
        }
      });
    }

    await updateLocation(socket);
    if (!intervalRef.current) {
      intervalRef.current = setInterval(
        () => updateLocation(socket),
        mapStore.parameters.updateInterval * 1000,
      );
    }
  }, [accessToken, apiUrl, updateLocation]);

  React.useEffect(() => {
    initializeSocket();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      disconnectSocket("geolocation");
      socketRef.current = null;
      listenerSetupDoneRef.current = false;
    };
  }, [initializeSocket, restartCount]);

  const restartSocket = React.useCallback(() => {
    mapStore.reset();
    setRestartCount((c) => c + 1);
  }, []);

  return {
    connected: mapStore.connected,
    loading: mapStore.loading,
    reconnection: mapStore.reconnection,
    nearbyUsers: mapStore.nearbyUsers,
    users: mapStore.users,
    location: mapStore.location,
    restartSocket,
  };
}
