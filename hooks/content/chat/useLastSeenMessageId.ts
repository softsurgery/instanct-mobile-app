import React from "react";
import {
  MessageVariant,
  ResponseConversationDto,
  ResponseMessageDto,
} from "@/types";

interface UseLastSeenMessageIdProps {
  conversation?: ResponseConversationDto | null;
  messages: ResponseMessageDto[];
  currentUserId?: string;
}

/**
 * Hook that computes the ID of the most recent outgoing message seen by the other participant
 * based on their lastCheck timestamp.
 */
export const useLastSeenMessageId = ({
  conversation,
  messages,
  currentUserId,
}: UseLastSeenMessageIdProps) => {
  return React.useMemo(() => {
    if (!conversation || !currentUserId) return null;

    const otherLastCheck = conversation.participants.find(
      (participant) => participant.userId !== currentUserId,
    )?.lastCheck;

    if (!otherLastCheck) return null;

    const lastCheckTime = new Date(otherLastCheck).getTime();
    let lastSeenMessageId: number | null = null;
    let lastSeenTime = 0;

    for (const message of messages) {
      if (message.userId !== currentUserId) continue;
      if (message.variant === MessageVariant.STATIC) continue;

      const messageTime = new Date(message.createdAt).getTime();
      if (messageTime <= lastCheckTime && messageTime > lastSeenTime) {
        lastSeenTime = messageTime;
        lastSeenMessageId = message.id;
      }
    }

    return lastSeenMessageId;
  }, [conversation, messages, currentUserId]);
};
