import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import {
  createAndroidChannel,
  requestNotificationPermissions,
} from "@/lib/notification";
import { getSocket } from "@/lib/socket";
import { sanitizeText } from "@/lib/string";
import * as Notifications from "expo-notifications";
import React from "react";
import { useTranslation } from "react-i18next";
import { Socket } from "socket.io-client";
import { ResponseNotificationDto } from "~/types/notifications";

export function useNotifications() {
  const { t } = useTranslation("notifications");
  const [notifications, setNotifications] = React.useState<
    ResponseNotificationDto[]
  >([]);
  const [count, setCount] = React.useState(0);
  const socketRef = React.useRef<Socket | null>(null);
  const { accessToken } = useAuthPersistStore();

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
      setNotifications((prev) => [...prev, notification]);
      setCount((prev) => prev + 1);
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
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  const resetCount = React.useCallback(() => setCount(0), []);

  return {
    notifications,
    count,
    resetCount,
    socket: socketRef.current,
  };
}
