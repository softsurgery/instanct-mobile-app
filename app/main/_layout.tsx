import { ChatContext } from "@/contexts/ChatContext";
import { NotificationContext } from "@/contexts/NotificationsContext";
import { useChat } from "@/hooks/content/chat/useChat";
import { useChatPendingSync } from "@/hooks/content/chat/useChatPendingSync";
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
  useChatPendingSync();
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
                title: "explore",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="explore/session-starter"
              options={{
                title: "sessionStarter",
                headerShown: false,
                animation: "simple_push",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="sessions/index"
              options={{
                title: "sessions",
                headerShown: false,
                animation: "simple_push",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="sessions/details"
              options={{
                title: "sessionDetails",
                headerShown: false,
                animation: "simple_push",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="sessions/manage"
              options={{
                title: "manageSession",
                headerShown: false,
                animation: "simple_push",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="explore/users-filter"
              options={{
                title: "userFilters",
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
                title: "notifications",
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
                title: "profile",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/create-experience"
              options={{
                title: "experience",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/update-experiences"
              options={{
                title: "experience",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/update-experience"
              options={{
                title: "editExperience",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/delete-experience"
              options={{
                title: "deleteExperience",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/create-education"
              options={{
                title: "createEducation",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/update-education"
              options={{
                title: "editEducation",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/update-educations"
              options={{
                title: "education",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/delete-education"
              options={{
                title: "deleteEducation",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/industries"
              options={{
                title: "industries",
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
                title: "calendar",
                headerShown: false,
              }}
            />
            {/* *************************************************************************************************** */}
            {/* Chat  ********************************************************************************************* */}
            <Stack.Screen
              name="chat"
              options={{
                title: "chat",
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
                title: "conversationDetails",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="chat/report-conversation"
              options={{
                title: "reportConversation",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="chat/conversation-resource-details"
              options={{
                title: "mediaFilesLinks",
                headerShown: false,
              }}
            />
            {/* *************************************************************************************************** */}
            {/* Settings  ****************************************************************************************** */}
            <Stack.Screen
              name="profile/email-success"
              options={{
                title: "emailChangedSuccess",
                headerShown: false,
                animation: "simple_push",
                animationDuration: 200,
              }}
            />

            <Stack.Screen
              name="profile/support/report-bug"
              options={{
                title: "settings.reportBug",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/support/send-feedback"
              options={{
                title: "settings.sendFeedback",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/support/faqs"
              options={{
                title: "settings.faqs",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="settings/index"
              options={{
                title: "settings.title",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/terms"
              options={{
                title: "settings.termsOfService",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/privacy-policy"
              options={{
                title: "settings.privacyPolicy",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/verify-email"
              options={{
                title: "verifyEmail",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/about"
              options={{
                title: "aboutInstanct",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/theme"
              options={{
                title: "settings.theme",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/language"
              options={{
                title: "settings.language",
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
                title: "privacySecurity",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/change-email"
              options={{
                title: "changeEmail",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/change-password"
              options={{
                title: "changePassword",
                headerShown: false,
              }}
            />
            {/* *************************************************************************************************** */}
            {/* Map  ****************************************************************************************** */}
            <Stack.Screen
              name="maps/map-settings"
              options={{
                title: "mapSettings",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            {/* Request  ********************************************************************************************* */}

            <Stack.Screen
              name="request/new-request"
              options={{
                title: "sendRequest",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="request/answer"
              options={{
                title: "acceptRequest",
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
                headerShown: false,
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
