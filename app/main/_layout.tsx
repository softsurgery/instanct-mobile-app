import { Stack } from "expo-router";
import React from "react";

export default function MainLayout() {
  return (
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
  );
}
