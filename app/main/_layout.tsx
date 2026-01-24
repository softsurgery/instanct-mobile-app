import { MapContext } from "@/contexts/MapContext";
import { useLiveGeolocation } from "@/hooks/content/geolocation/useLiveGeolocation";
import { Stack } from "expo-router";
import React from "react";

export default function MainLayout() {
  const { restartSocket } = useLiveGeolocation({});

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
        {/* Notification  ************************************************************************************* */}
        <Stack.Screen
          name="notifications"
          options={{
            title: "Notification",
            headerShown: false,
          }}
        />
        {/* *************************************************************************************************** */}
        {/* Profile ********************************************************************************************* */}
        <Stack.Screen
          name="profile/inspect-profile"
          options={{
            title: "",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/update-profile"
          options={{
            title: "My Profile",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/update-experiences"
          options={{
            title: "Experiences",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/edit-experiences"
          options={{
            title: "Edit Experiences",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/update-educations"
          options={{
            title: "Educations",
            headerShown: false,
          }}
        />
        {/* *************************************************************************************************** */}
        {/* Chat  ********************************************************************************************* */}
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
        {/* *************************************************************************************************** */}
        {/* Settings  ****************************************************************************************** */}
        <Stack.Screen
          name="settings"
          options={{
            title: "Settings",
            headerShown: false,
            animation: "fade_from_bottom",
            animationDuration: 200,
          }}
        />
        {/* *************************************************************************************************** */}
        {/* Test  ********************************************************************************************* */}
        <Stack.Screen
          name="test"
          options={{
            title: "Try Anything",
            animation: "fade_from_bottom",
            animationDuration: 200,
          }}
        />
      </Stack>
    </MapContext.Provider>
  );
}
