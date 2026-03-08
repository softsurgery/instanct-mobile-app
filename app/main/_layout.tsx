import { MapContext } from "@/contexts/MapContext";
import { useLiveGeolocation } from "@/hooks/content/geolocation/useLiveGeolocation";
import { useLiveGeolocationParameters } from "@/hooks/content/geolocation/useLiveGeolocationParamters";
import { useCheckHealth } from "@/hooks/content/useCheckHealth";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { Stack } from "expo-router";
import React from "react";

export default function MainLayout() {
  const authPersistStore = useAuthPersistStore();
  const { isPending } = useLiveGeolocationParameters();
  const { restartSocket } = useLiveGeolocation({ enabled: !isPending });
  useCheckHealth({
    enabled: authPersistStore.isAuthenticated,
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
        <Stack.Screen
          name="explore/session-starter"
          options={{
            title: "Session Starter",
            headerShown: false,
            animation: "simple_push",
            animationDuration: 200,
          }}
        />
        <Stack.Screen
          name="explore/session-history"
          options={{
            title: "Session History",
            headerShown: false,
            animation: "simple_push",
            animationDuration: 200,
          }}
        />
        {/* *************************************************************************************************** */}
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
          name="profile/create-experience"
          options={{
            title: "Experiences",
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
          name="profile/update-experience"
          options={{
            title: "Edit Experiences",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/delete-experience"
          options={{
            title: "Delete Experiences",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/create-education"
          options={{
            title: "Create Education",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/update-education"
          options={{
            title: "Edit Education",
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
        <Stack.Screen
          name="profile/delete-education"
          options={{
            title: "Delete Educations",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/industries"
          options={{
            title: "Industries",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/objectives"
          options={{
            title: "Objectives",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/user-calendar"
          options={{
            title: "Calendar",
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
        <Stack.Screen
          name="chat/conversation-details"
          options={{
            title: "Conversation Details",
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
        <Stack.Screen
          name="profile/support/report-bug"
          options={{
            title: "Report a Bug",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/support/send-feedback"
          options={{
            title: "Send Feedback",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/support/faqs"
          options={{
            title: "FAQs",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="terms"
          options={{
            title: "Terms & Conditions",
            headerShown: false,
            animation: "fade_from_bottom",
            animationDuration: 200,
          }}
        />
        <Stack.Screen
          name="privacy-policy"
          options={{
            title: "Privacy Policy",
            headerShown: false,
            animation: "fade_from_bottom",
            animationDuration: 200,
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            title: "About Instanct",
            headerShown: false,
            animation: "fade_from_bottom",
            animationDuration: 200,
          }}
        />
        {/* *************************************************************************************************** */}
        {/* Map  ****************************************************************************************** */}
        <Stack.Screen
          name="maps/map-settings"
          options={{
            title: "Map Settings",
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
