import { ResponseNotificationDto } from "@/types";
import React from "react";

interface NotificationContextProps {
  notifications: ResponseNotificationDto[];
  newCount: number;
  resetCount: () => void;
}

export const NotificationContext =
  React.createContext<NotificationContextProps>({
    notifications: [],
    newCount: 0,
    resetCount: () => {},
  });

export const useNotificationContext = () =>
  React.useContext(NotificationContext);
