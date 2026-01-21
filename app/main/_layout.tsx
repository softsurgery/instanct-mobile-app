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
      <Stack
        screenOptions={{
          contentStyle: {
            flex: 1,
          },
        }}
      >
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
            headerShown: false,
          }}
        />
        {/* Profile */}
        <Stack.Screen
          name="inspect-profile"
          options={{
            title: "",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="update-profile"
          options={{
            title: "My Profile",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="edit-screen"
          options={{
            title: "Edit Screen",
            headerShown: false,
          }}
        />
        {/* chat */}
        <Stack.Screen
          name="chat"
          options={{
            title: "Chat",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="chat/conversation"
          options={{
            title: "",
            headerShown: false,
          }}
        />

        {/* Settings */}
        <Stack.Screen
          name="settings"
          options={{
            title: "Settings",
            headerShown: false,
            animation: "fade_from_bottom",
            animationDuration: 200,
          }}
        />

        {/* Scene */}
        <Stack.Screen
          name="scene-screen"
          options={{
            title: "",
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </MapContext.Provider>
  );
}
