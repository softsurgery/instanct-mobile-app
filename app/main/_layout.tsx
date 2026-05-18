import { ChatContext } from "@/contexts/ChatContext";
import { useChat } from "@/hooks/content/chat/useChat";
import { useLiveGeolocation } from "@/hooks/content/geolocation/useLiveGeolocation";
import { useCheckHealth } from "@/hooks/content/useCheckHealth";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { hslToHex, THEME } from "@/lib/theme";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";

export default function MainLayout() {
  const { colorScheme } = useColorScheme();
  const isDarkColorScheme = colorScheme === "dark";
  const authPersistStore = useAuthPersistStore();
  const {} = useLiveGeolocation({
    enabled: authPersistStore.isAuthenticated,
    join: ["user", "user.industries"],
  });
  useCheckHealth({
    enabled: authPersistStore.isAuthenticated,
  });

  const { count: chatCount, resetCount: resetChatCount } = useChat();

  return (
    <ChatContext.Provider
      value={{
        count: chatCount,
        resetCount: resetChatCount,
      }}
    >
      <Stack
        screenOptions={{
          contentStyle: {
            flex: 1,
            backgroundColor: hslToHex(
              isDarkColorScheme
                ? THEME.dark.background
                : THEME.light.background,
            ),
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
          name="sessions/index"
          options={{
            title: "Session History",
            headerShown: false,
            animation: "simple_push",
            animationDuration: 200,
          }}
        />
        <Stack.Screen
          name="sessions/details"
          options={{
            title: "Session Details",
            headerShown: false,
            animation: "simple_push",
            animationDuration: 200,
          }}
        />
        <Stack.Screen
          name="sessions/manage"
          options={{
            title: "Manage Session",
            headerShown: false,
            animation: "simple_push",
            animationDuration: 200,
          }}
        />
        <Stack.Screen
          name="explore/users-filter"
          options={{
            title: "User Filters",
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
        <Stack.Screen
          name="profile/sessions/details"
          options={{
            title: "Sessions",
            headerShown: false,
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
        {/* Request  ********************************************************************************************* */}

        <Stack.Screen
          name="request/new-request"
          options={{
            title: "Send a Request",
            headerShown: false,
            animation: "fade_from_bottom",
            animationDuration: 200,
          }}
        />
        <Stack.Screen
          name="request/answer"
          options={{
            title: "Accept",
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
    </ChatContext.Provider>
  );
}
