import React from "react";
import { getSocket } from "@/lib/socket";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";

interface UserStatus {
  userId: string;
  isOnline: boolean;
  lastSeen: string | null;
}

interface UseUserPresenceProps {
  userId?: string;
}

export const useUserPresence = ({ userId }: UseUserPresenceProps) => {
  const [isOnline, setIsOnline] = React.useState(false);
  const [lastSeen, setLastSeen] = React.useState<Date | null>(null);
  const authPersistStore = useAuthPersistStore();

  React.useEffect(() => {
    if (!userId) return;

    const s = getSocket("chat", { token: authPersistStore.accessToken });

    const onUserStatus = (status: UserStatus) => {
      if (status.userId === userId) {
        setIsOnline(status.isOnline);
        setLastSeen(status.lastSeen ? new Date(status.lastSeen) : null);
      }
    };

    const onUserPresence = (status: UserStatus) => {
      if (status.userId === userId) {
        setIsOnline(status.isOnline);
        setLastSeen(status.lastSeen ? new Date(status.lastSeen) : null);
      }
    };

    const onConnect = () => {
      s.emit("get-user-status", { userId });
    };

    s.on("user-status", onUserStatus);
    s.on("user-presence", onUserPresence);
    s.on("connect", onConnect);

    if (s.connected) {
      s.emit("get-user-status", { userId });
    }

    return () => {
      s.off("user-status", onUserStatus);
      s.off("user-presence", onUserPresence);
      s.off("connect", onConnect);
    };
  }, [userId, authPersistStore.accessToken]);

  return { isOnline, lastSeen };
};
