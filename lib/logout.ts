import { router } from "expo-router";

import { useMapStore } from "@/stores/useMapStore";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { useRequestStore } from "@/stores/useRequestStore";
import { useExploreFilterStore } from "@/stores/userExploreFilterStore";
import { useReportBugStore } from "@/stores/useReportBugStore";
import { useSendFeedbackStore } from "@/stores/useFeedbackManager";
import { disconnectAllSockets } from "@/lib/socket";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";

export const performLogout = () => {
  // Clear persisted auth
  useAuthPersistStore.getState().logout?.();

  // Reset all stores
  useMapStore.getState().reset();
  useUserStore.getState().reset();
  useAuthStore.getState().reset();
  useSessionStore.getState().reset();
  useRequestStore.getState().reset();
  useExploreFilterStore.getState().reset();
  useReportBugStore.getState().reset();
  useSendFeedbackStore.getState().reset();

  // Disconnect sockets
  disconnectAllSockets();

  // Navigate to login/splash
  router.replace("/");
};
