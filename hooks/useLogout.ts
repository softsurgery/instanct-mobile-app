import { useQueryClient } from "@tanstack/react-query";
import { useAuthPersistStore } from "./useAuthPersistStore";
import { useMapStore } from "@/stores/useMapStore";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { useRequestStore } from "@/stores/useRequestStore";
import { useExploreFilterStore } from "@/stores/userExploreFilterStore";
import { useReportBugStore } from "@/stores/useReportBugStore";
import { useSendFeedbackStore } from "@/stores/useFeedbackManager";
import { useChatPendingStore } from "@/stores/useChatPendingStore";
import { disconnectAllSockets } from "@/lib/socket";
import { router } from "expo-router";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const authPersistStore = useAuthPersistStore();
  const mapStore = useMapStore();
  const userStore = useUserStore();
  const authStore = useAuthStore();
  const sessionStore = useSessionStore();
  const requestStore = useRequestStore();
  const exploreFilterStore = useExploreFilterStore();
  const reportBugStore = useReportBugStore();
  const sendFeedbackStore = useSendFeedbackStore();

  const logout = () => {
    // 1. Clear query cache
    queryClient.clear();

    // 2. Clear persist auth token
    authPersistStore.logout?.();

    // 3. Reset all zustand stores
    mapStore.reset();
    userStore.reset();
    authStore.reset();
    sessionStore.reset();
    requestStore.reset();
    exploreFilterStore.reset();
    reportBugStore.reset();
    sendFeedbackStore.reset();
    useChatPendingStore.getState().reset();

    // 4. Disconnect all sockets
    disconnectAllSockets();

    // 5. Navigate to splash / login
    router.replace("/");
  };

  return logout;
};
