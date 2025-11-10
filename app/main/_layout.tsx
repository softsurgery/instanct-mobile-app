import { MapContext } from "@/contexts/MapContext";
import { useLiveGeolocation } from "@/hooks/content/geolocation/useLiveGeolocation";
import { Stack } from "expo-router";
import React from "react";

export default function MainLayout() {
  const { restartSocket } = useLiveGeolocation({
    updateInterval: 5,
    radiusKm: 4,
  });
  return (
    <MapContext.Provider value={{ restartSocket }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "",
            headerShown: false,
            animation: "fade_from_bottom",
            animationDuration: 200,
          }}
        />
        {/* Main Application */}
        <Stack.Screen
          name="(tabs)"
          options={{
            title: "",
            headerShown: false,
            animation: "fade_from_bottom",
            animationDuration: 200,
          }}
        />
        {/* Notification */}
        <Stack.Screen
          name="notifications"
          options={{
            title: "Notification",
          }}
        />
        <Stack.Screen
          name="update-profile"
          options={{
            title: "My Profile",
          }}
        />

        {/* Settings */}
        <Stack.Screen
          name="settings"
          options={{
            title: "Settings",
            animation: "fade_from_bottom",
            animationDuration: 200,
            headerBackVisible: false,
          }}
        />
      </Stack>
    </MapContext.Provider>
  );
}
