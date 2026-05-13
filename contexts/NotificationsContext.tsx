import { ResponseNotificationDto } from "@/types";
import React from "react";

interface NotificationContextProps {
  notifications: ResponseNotificationDto[];
  count: number;
  resetCount: () => void;
}

export const NotificationContext =
  React.createContext<NotificationContextProps>({
    notifications: [],
    count: 0,
    resetCount: () => {},
  });

export const useNotificationContext = () =>
  React.useContext(NotificationContext);
