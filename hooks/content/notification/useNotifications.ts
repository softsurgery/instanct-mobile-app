import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { getSocket } from "@/lib/socket";
import { sanitizeText } from "@/lib/string";
import * as Notifications from "expo-notifications";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";
import { ResponseNotificationDto } from "~/types/notifications";

const SOCKET_URL = `${process.env.EXPO_PUBLIC_API_SOCKET_URL}/notifications`;

async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.warn("Notification permissions not granted");
  }
}

async function createAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export function useNotifications() {
  const { t } = useTranslation("notifications");
  const [notifications, setNotifications] = React.useState<
    ResponseNotificationDto[]
  >([]);
  const [newCount, setNewCount] = React.useState(0);
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
      setNewCount((prev) => prev + 1);
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

  const resetCount = React.useCallback(() => setNewCount(0), []);

  return {
    notifications,
    newCount,
    resetCount,
    socket: socketRef.current,
  };
}
