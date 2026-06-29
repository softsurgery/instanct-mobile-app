import { create } from "zustand";
import {
  MessageVariant,
  PendingMediaUpload,
  PendingTextMessage,
  ResponseMessageDto,
} from "@/types";

interface ChatPendingStore {
  pendingTextMessages: PendingTextMessage[];
  pendingMediaUploads: PendingMediaUpload[];
  sentTextQueues: Record<number, string[]>;

  addPendingText: (message: PendingTextMessage) => void;
  removePendingText: (clientId: string) => void;
  enqueueSentText: (conversationId: number, clientId: string) => void;
  dequeueSentText: (conversationId: number) => string | undefined;

  addPendingMedia: (upload: PendingMediaUpload) => void;
  updatePendingMedia: (
    clientId: string,
    patch: Partial<PendingMediaUpload>,
  ) => void;
  removePendingMedia: (clientId: string) => void;

  reconcileTextPending: (
    conversationId: number,
    messages: ResponseMessageDto[],
    userId: string,
  ) => void;

  reset: () => void;
}

const initialState = {
  pendingTextMessages: [] as PendingTextMessage[],
  pendingMediaUploads: [] as PendingMediaUpload[],
  sentTextQueues: {} as Record<number, string[]>,
};

export const useChatPendingStore = create<ChatPendingStore>((set, get) => ({
  ...initialState,

  addPendingText: (message) => {
    set((state) => ({
      pendingTextMessages: [message, ...state.pendingTextMessages],
    }));
  },

  removePendingText: (clientId) => {
    set((state) => ({
      pendingTextMessages: state.pendingTextMessages.filter(
        (pending) => pending.clientId !== clientId,
      ),
    }));
  },

  enqueueSentText: (conversationId, clientId) => {
    set((state) => {
      const queue = [...(state.sentTextQueues[conversationId] ?? []), clientId];
      return {
        sentTextQueues: {
          ...state.sentTextQueues,
          [conversationId]: queue,
        },
      };
    });
  },

  dequeueSentText: (conversationId) => {
    const queue = [...(get().sentTextQueues[conversationId] ?? [])];
    const clientId = queue.shift();
    set((state) => ({
      sentTextQueues: {
        ...state.sentTextQueues,
        [conversationId]: queue,
      },
    }));
    return clientId;
  },

  addPendingMedia: (upload) => {
    set((state) => ({
      pendingMediaUploads: [upload, ...state.pendingMediaUploads],
    }));
  },

  updatePendingMedia: (clientId, patch) => {
    set((state) => ({
      pendingMediaUploads: state.pendingMediaUploads.map((item) =>
        item.clientId === clientId ? { ...item, ...patch } : item,
      ),
    }));
  },

  removePendingMedia: (clientId) => {
    set((state) => ({
      pendingMediaUploads: state.pendingMediaUploads.filter(
        (pending) => pending.clientId !== clientId,
      ),
    }));
  },

  reconcileTextPending: (conversationId, messages, userId) => {
    const state = get();
    const queue = [...(state.sentTextQueues[conversationId] ?? [])];
    const pendingForConversation = state.pendingTextMessages.filter(
      (pending) => pending.conversationId === conversationId,
    );

    if (queue.length === 0 || pendingForConversation.length === 0) return;

    const myTextMessages = messages
      .filter(
        (message) =>
          message.conversationId === conversationId &&
          message.userId === userId &&
          message.variant === MessageVariant.TEXT,
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

    let nextQueue = queue;
    let nextPending = state.pendingTextMessages;

    for (const message of myTextMessages) {
      const clientId = nextQueue[0];
      if (!clientId) break;

      const pending = nextPending.find((item) => item.clientId === clientId);
      if (
        !pending ||
        pending.content.trim() !== message.content.trim() ||
        new Date(message.createdAt).getTime() < pending.createdAt.getTime()
      ) {
        continue;
      }

      nextQueue = nextQueue.slice(1);
      nextPending = nextPending.filter((item) => item.clientId !== clientId);
    }

    if (
      nextQueue.length === queue.length &&
      nextPending.length === state.pendingTextMessages.length
    ) {
      return;
    }

    set({
      sentTextQueues: {
        ...state.sentTextQueues,
        [conversationId]: nextQueue,
      },
      pendingTextMessages: nextPending,
    });
  },

  reset: () => set(initialState),
}));
