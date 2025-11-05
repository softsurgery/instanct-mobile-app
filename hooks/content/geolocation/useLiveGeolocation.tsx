import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { disconnectSocket, getSocket } from "@/lib/socket";
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

  const [nearbyUsers, setNearbyUsers] = React.useState<NearbyUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [location, setLocation] =
    React.useState<Location.LocationObject | null>(null);

  const socketRef = React.useRef<Socket | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const updateLocation = React.useCallback(
    async (socket?: Socket) => {
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(pos);

        (socket ?? socketRef.current)?.emit("update_location", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          radius: radiusKm,
        });
      } catch (e) {
        console.warn("⚠️ Failed to fetch location:", e);
      }
    },
    [radiusKm]
  );

  React.useEffect(() => {
    let isMounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("❌ Location permission denied");
        if (isMounted) setLoading(false);
        return;
      }

      const socket = getSocket("geolocation", apiUrl, accessToken);
      socketRef.current = socket;

      socket.on("connect", async () => {
        socket.emit("identify");
        await updateLocation(socket);
        if (isMounted) setLoading(false);
      });

      socket.on("nearby_users", (users: NearbyUser[]) => {
        if (isMounted) setNearbyUsers(users);
      });

      socket.on("user_moved", (data: NearbyUser) => {
        if (!isMounted) return;
        setNearbyUsers((prev) => {
          const index = prev.findIndex((u) => u.userId === data.userId);
          if (index !== -1) {
            const copy = [...prev];
            copy[index] = { ...copy[index], ...data };
            return copy;
          }
          return [...prev, data];
        });
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
    };
  }, [accessToken, apiUrl, updateInterval, updateLocation]);

  return { location, nearbyUsers, loading };
}
