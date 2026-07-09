import React from "react";
import { View } from "react-native";

import { MessageSeenIndicator } from "./MessageSeenIndicator";

interface SeenMessageWrapperProps {
  showSeen: boolean;
  pictureId?: number;
  avatarFallback: string;
  children: React.ReactNode;
}

/**
 * Layout wrapper that conditionally renders a MessageSeenIndicator below its child message bubble.
 */
export const SeenMessageWrapper = ({
  showSeen,
  pictureId,
  avatarFallback,
  children,
}: SeenMessageWrapperProps) => {
  if (!showSeen) return <>{children}</>;

  return (
    <View className="flex flex-col gap-2">
      {children}
      <MessageSeenIndicator pictureId={pictureId} fallback={avatarFallback} />
    </View>
  );
};
