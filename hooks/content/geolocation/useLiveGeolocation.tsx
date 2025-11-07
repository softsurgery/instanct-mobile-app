import { api } from "@/api";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { disconnectSocket, getSocket } from "@/lib/socket";
import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser, ResponseClientDto } from "@/types";
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

  /** --- 🧩 Fetch and cache new user info when nearby users change --- */
  const fetchMissingUsers = React.useCallback(
    async (nearby: NearbyUser[]) => {
      const existingIds = new Set(mapStore.users.map((u) => u.id));
      const missing = nearby.filter((u) => !existingIds.has(u.userId));

      if (missing.length === 0) return;

      try {
        const fetchedUsers = await Promise.all(
          missing.map(async (u) => {
            try {
              const res = await api.client.findById(u.userId);
              return res as ResponseClientDto;
            } catch (err) {
              console.warn(`⚠️ Failed to fetch user ${u.userId}:`, err);
              return null;
            }
          })
        );

        const valid = fetchedUsers.filter(
          (u): u is ResponseClientDto => u !== null
        );

        if (valid.length > 0) {
          mapStore.set("users", [...mapStore.users, ...valid]);
        }
      } catch (err) {
        console.warn("⚠️ Error fetching missing users:", err);
      }
    },
    [mapStore.users]
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
        if (isMounted) mapStore.set("connected", false);
      });

      /** 🔁 Reconnection lifecycle */
      socket.io.on("reconnect_attempt", (attempt: number) => {
        const delay = Math.min(2000 * Math.pow(1.5, attempt - 1), 10000);
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

      socket.on("nearby_users", async (users: NearbyUser[]) => {
        if (!isMounted) return;

        mapStore.setNearbyUsers(users);

        for (const u of users) {
          const existing = mapStore.getUserById(u.userId);
          if (!existing) {
            try {
              // Fetch once for new users
              const userResp = await api.client.findById(u.userId);
              mapStore.set("users", [...mapStore.users, userResp]);
            } catch (e) {
              console.warn("Failed to fetch user info:", e);
            }
          }
        }
      });

      socket.on("user_moved", async (data: NearbyUser) => {
        if (!isMounted) return;
        mapStore.updateNearbyUser(data);

        const existing = mapStore.getUserById(data.userId);
        if (!existing) {
          try {
            const userResp = await api.client.findById(data.userId);
            mapStore.set("users", [...mapStore.users, userResp]);
          } catch (e) {
            console.warn("Failed to fetch user info:", e);
          }
        }
      });

      await updateLocation(socket);
      intervalRef.current = setInterval(
        () => updateLocation(socket),
        updateInterval * 1000
      );
    })();

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      disconnectSocket("geolocation");
      socketRef.current = null;
      mapStore.set("connected", false);
    };
  }, [accessToken, apiUrl, updateInterval, updateLocation, fetchMissingUsers]);

  return {
    connected: mapStore.connected,
    loading: mapStore.loading,
    reconnection: mapStore.reconnection,
    nearbyUsers: mapStore.nearbyUsers,
    users: mapStore.users,
    location: mapStore.location,
  };
}
