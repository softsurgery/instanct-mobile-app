import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          flex: 1,
        },
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{
          title: "",
          headerShown: false,
          headerRight: () => <ThemeToggle />,
          animation: "fade",
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: "",
          headerShown: false,
          headerRight: () => <ThemeToggle />,
          animation: "fade",
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="sign-up-carry-on"
        options={{
          title: "",
          headerShown: false,
          headerRight: () => <ThemeToggle />,
          animation: "fade",
          animationDuration: 200,
        }}
      />
    </Stack>
  );
}
