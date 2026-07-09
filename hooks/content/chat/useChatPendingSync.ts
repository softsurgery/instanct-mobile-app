import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { useCurrentUser } from "../users/useCurrentUser";
import { useChatPendingStore } from "@/stores/useChatPendingStore";
import {
  conversationLinksMessagesQueryKey,
  prependMessageToConversationLinksCache,
} from "@/lib/chat";
import { messageHasLinks } from "@/lib/messageLinks";
import { MessageVariant, ResponseMessageDto } from "@/types";

interface CachedConversationMessages {
  messages: ResponseMessageDto[];
  hasMore: boolean;
  currentPage: number;
}

/**
 * Effect hook that synchronizes real-time incoming messages with React Query cache
 * and reconciles outgoing pending text messages in useChatPendingStore.
 */
export const useChatPendingSync = () => {
  const queryClient = useQueryClient();
  const authPersistStore = useAuthPersistStore();
  const { currentUser } = useCurrentUser();

  React.useEffect(() => {
    const s = getSocket("chat", { token: authPersistStore.accessToken });
    const userId = currentUser?.id;

    /**
     * Handler invoked when Socket.io receives a new message.
     * Updates React Query message caches and dequeues matching pending text items.
     */
    const onMessage = (message: ResponseMessageDto) => {
      queryClient.setQueryData<CachedConversationMessages>(
        ["conversation-messages", message.conversationId],
        (prev) => {
          const existing = prev?.messages ?? [];
          if (existing.some((item) => item.id === message.id)) {
            return prev;
          }

          return {
            messages: [message, ...existing],
            hasMore: prev?.hasMore ?? true,
            currentPage: prev?.currentPage ?? 1,
          };
        },
      );

      if (messageHasLinks(message)) {
        queryClient.setQueryData(
          conversationLinksMessagesQueryKey(message.conversationId),
          (oldData) =>
            prependMessageToConversationLinksCache(
              oldData as Parameters<
                typeof prependMessageToConversationLinksCache
              >[0],
              message,
            ),
        );
      }

      if (
        userId &&
        message.userId === userId &&
        message.variant === MessageVariant.TEXT
      ) {
        const clientId = useChatPendingStore
          .getState()
          .dequeueSentText(message.conversationId);
        if (clientId) {
          useChatPendingStore.getState().removePendingText(clientId);
        }
      }
    };

    s.on("message", onMessage);

    return () => {
      s.off("message", onMessage);
    };
  }, [authPersistStore.accessToken, currentUser?.id, queryClient]);
};
