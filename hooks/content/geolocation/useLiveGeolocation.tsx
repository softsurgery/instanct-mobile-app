import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { disconnectSocket, getSocket } from "@/lib/socket";
import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser } from "@/types";
import * as Location from "expo-location";
import React from "react";
import { Socket } from "socket.io-client";

interface UseLiveGeolocationOptions {
  updateInterval?: number;
  radiusKm?: number;
}

export function useLiveGeolocation({
  updateInterval = 5,
  radiusKm = 5,
}: UseLiveGeolocationOptions) {
  const apiUrl = process.env.EXPO_PUBLIC_API_SOCKET_URL!;
  const { accessToken } = useAuthPersistStore();
  const mapStore = useMapStore();

  const socketRef = React.useRef<Socket | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  /** --- 🛰️ Updates the current device location and emits it --- */
  const updateLocation = React.useCallback(
    async (socket?: Socket) => {
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        mapStore.set("location", pos);

        (socket ?? socketRef.current)?.emit("update_location", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          radius: radiusKm,
        });
      } catch (err) {
        console.warn("⚠️ Failed to fetch location:", err);
      }
    },
    [radiusKm]
  );

  /** --- 🔌 Initialize and manage socket connection --- */
  React.useEffect(() => {
    let isMounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("❌ Location permission denied");
        if (isMounted) mapStore.set("loading", false);
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
        // console.log("🟢 Connected to geolocation socket");
        socket.emit("identify");
        if (isMounted) {
          mapStore.set("connected", true);
          mapStore.set("loading", false);
          mapStore.set("reconnection", {
            reconnecting: false,
            reconnectAttempt: 0,
            reconnectDelay: 0,
          });
        }
        await updateLocation(socket);
      });

      /** 🔴 Disconnected */
      socket.on("disconnect", () => {
        // console.log("🔴 Disconnected from geolocation socket");
        if (isMounted) mapStore.set("connected", false);
      });

      /** 🔁 Reconnection events (safe) */
      socket.io.on("reconnect_attempt", (attempt: number) => {
        const baseDelay = 2000; // from options
        const maxDelay = 10000;
        // approximate backoff manually (Socket.IO uses exponential backoff)
        const delay = Math.min(
          baseDelay * Math.pow(1.5, attempt - 1),
          maxDelay
        );

        // console.log(`🔁 Reconnect attempt #${attempt} (next in ~${delay}ms)`);
        if (isMounted)
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
        if (isMounted) mapStore.setNested("reconnection.reconnecting", false);
      });

      socket.io.on("reconnect", async (attempt: number) => {
        // console.log(`✅ Successfully reconnected after ${attempt} attempts`);
        if (isMounted) {
          mapStore.set("connected", true);
          mapStore.set("reconnection", {
            reconnecting: false,
            reconnectAttempt: attempt,
            reconnectDelay: 0,
          });
        }
        await updateLocation(socket);
      });

      /** 👥 Handle user updates */
      socket.on("nearby_users", (users: NearbyUser[]) => {
        if (isMounted) mapStore.setNearbyUsers(users);
      });

      socket.on("user_moved", (data: NearbyUser) => {
        if (isMounted) mapStore.updateNearbyUser(data);
      });

      /** 🕐 Periodically update location */
      await updateLocation(socket);
      intervalRef.current = setInterval(
        () => updateLocation(socket),
        updateInterval * 1000
      );
    })();

    /** 🧹 Cleanup */
    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      disconnectSocket("geolocation");
      socketRef.current = null;
      mapStore.set("connected", false);
    };
  }, [accessToken, apiUrl, updateInterval, updateLocation]);

  return {
    connected: mapStore.connected,
    loading: mapStore.loading,
    reconnection: mapStore.reconnection,
    nearbyUsers: mapStore.nearbyUsers,
    location: mapStore.location,
  };
}
