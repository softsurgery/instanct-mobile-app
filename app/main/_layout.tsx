import { ChatContext } from "@/contexts/ChatContext";
import { NotificationContext } from "@/contexts/NotificationsContext";
import { useChat } from "@/hooks/content/chat/useChat";
import { useLiveGeolocation } from "@/hooks/content/geolocation/useLiveGeolocation";
import { useNotifications } from "@/hooks/content/notification/useNotifications";
import { useCheckHealth } from "@/hooks/content/useCheckHealth";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import React from "react";
import { ActiveMapSessionContext } from "@/contexts/ActiveMapSessionContext";
import { useActiveSessions } from "@/hooks/content/sessions/useActiveSessions";
import { useColorPalette } from "@/hooks/useColorPalette";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationType } from "@/types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function MainLayout() {
  const queryClient = useQueryClient();
  const { palette } = useColorPalette();
  const authPersistStore = useAuthPersistStore();
  const {} = useLiveGeolocation({
    enabled: authPersistStore.isAuthenticated,
    join: ["user", "user.industries"],
  });
  useCheckHealth({
    enabled: authPersistStore.isAuthenticated,
  });

  const { count: chatCount, resetCount: resetChatCount } = useChat({});
  const {
    count: notificationCount,
    notifications,
    resetCount: resetNotificationCount,
  } = useNotifications({
    consequences: {
      [NotificationType.TEST]: () => {},
      [NotificationType.NEW_SIGNIN]: () => {},
      [NotificationType.REQUEST_RECEIVED]: () => {
        queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      },
      [NotificationType.REQUEST_ACCEPTED]: () => {
        queryClient.invalidateQueries({ queryKey: ["outgoing-requests"] });
      },
      [NotificationType.REQUEST_REJECTED]: () => {
        queryClient.invalidateQueries({ queryKey: ["outgoing-requests"] });
      },
    },
  });

  const { mapSession, isSessionsPending } = useActiveSessions();

  React.useEffect(() => {
    queryClient.invalidateQueries();
  }, []);

  return (
    <ActiveMapSessionContext.Provider
      value={{
        activeSession: mapSession,
        initialized: !isSessionsPending,
      }}
    >
      <NotificationContext.Provider
        value={{
          count: notificationCount,
          notifications,
          resetCount: resetNotificationCount,
        }}
      >
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
                backgroundColor: palette.background,
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
            {/* <Stack.Screen
              name="profile/objectives"
              options={{
                title: "Objectives",
                headerShown: false,
              }}
            /> */}
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
            <Stack.Screen
              name="chat/conversation-resource-details"
              options={{
                title: "Media, files and links",
                headerShown: false,
              }}
            />
            {/* *************************************************************************************************** */}
            {/* Settings  ****************************************************************************************** */}
            <Stack.Screen
              name="profile/email-success"
              options={{
                title: "Email Changed Successfully",
                headerShown: false,
                animation: "simple_push",
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
              name="settings/index"
              options={{
                title: "Settings",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/terms"
              options={{
                title: "Terms & Conditions",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/privacy-policy"
              options={{
                title: "Privacy Policy",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/verify-email"
              options={{
                title: "Verify Email",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/about"
              options={{
                title: "About Instanct",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/theme"
              options={{
                title: "Theme",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/language"
              options={{
                title: "Language",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            {/* <Stack.Screen
              name="profile/sessions/details"
              options={{
                title: "Sessions",
                headerShown: false,
              }}
            /> */}
            <Stack.Screen
              name="profile/privacy-security"
              options={{
                title: "Privacy & Security",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/change-email"
              options={{
                title: "Change Email",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/change-password"
              options={{
                title: "Change Password",
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
            <Stack.Screen
              name="test/deep-link-test"
              options={{
                title: "Deep Link Test",
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
          </Stack>
        </ChatContext.Provider>
      </NotificationContext.Provider>
    </ActiveMapSessionContext.Provider>
  );
}
