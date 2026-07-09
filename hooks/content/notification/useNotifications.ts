import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import {
  createAndroidChannel,
  requestNotificationPermissions,
} from "@/lib/notification";
import { disconnectSocket, getSocket } from "@/lib/socket";
import { sanitizeText } from "@/lib/string";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import React from "react";
import { useTranslation } from "react-i18next";
import { Socket } from "socket.io-client";
import { api } from "~/api";
import {
  NotificationType,
  ResponseNotificationDto,
} from "~/types/notifications";

export const NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY = [
  "notifications-unread-count",
] as const;

interface useNotificationsProps {
  enabled?: boolean;
  consequences?: Record<NotificationType, (...args: any[]) => void>;
}

export function useNotifications(
  { enabled = true, consequences }: useNotificationsProps = { enabled: true },
) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("notifications");
  const [notifications, setNotifications] = React.useState<
    ResponseNotificationDto[]
  >([]);
  const socketRef = React.useRef<Socket | null>(null);
  const { accessToken, isAuthenticated } = useAuthPersistStore();

  const { data: count = 0 } = useQuery({
    queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
    queryFn: () => api.notifications.getUnreadCount(),
    enabled: enabled && isAuthenticated,
  });

  const { mutate: markAllAsRead } = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueryData(NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY, 0);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  React.useEffect(() => {
    (async () => {
      await requestNotificationPermissions();
      await createAndroidChannel();
    })();
  }, []);

  React.useEffect(() => {
    const socket = getSocket("notifications", {
      token: accessToken,
    });

    socketRef.current = socket;

    socket.on("notification", async (notification: ResponseNotificationDto) => {
      if (!enabled) return;
      setNotifications((prev) => [...prev, notification]);
      queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      consequences?.[notification.type]?.(notification);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: sanitizeText(
            t(`titles.${notification.type}`, notification.payload).toString(),
          ),
          body: sanitizeText(
            t(
              `descriptions.${notification.type}`,
              notification.payload,
            ).toString(),
          ),
          sound: true,
        },
        trigger: null,
      });
    });

    return () => {
      disconnectSocket("notifications");
      socketRef.current = null;
    };
  }, [accessToken, consequences, enabled, queryClient, t]);

  const resetCount = React.useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  return {
    notifications,
    count,
    resetCount,
    socket: socketRef.current,
  };
}
