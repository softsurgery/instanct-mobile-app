import { create } from "zustand";
import {
  MessageVariant,
  PendingFileUpload,
  PendingMediaUpload,
  PendingTextMessage,
  ResponseMessageDto,
} from "@/types";

interface ChatPendingStore {
  pendingTextMessages: PendingTextMessage[];
  pendingMediaUploads: PendingMediaUpload[];
  pendingFileUploads: PendingFileUpload[];
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

  addPendingFile: (upload: PendingFileUpload) => void;
  updatePendingFile: (
    clientId: string,
    patch: Partial<PendingFileUpload>,
  ) => void;
  removePendingFile: (clientId: string) => void;

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
  pendingFileUploads: [] as PendingFileUpload[],
  sentTextQueues: {} as Record<number, string[]>,
};

export const useChatPendingStore = create<ChatPendingStore>((set, get) => ({
  ...initialState,

  /**
   * Adds an optimistic pending text message to the start of the list.
   */
  addPendingText: (message) => {
    set((state) => ({
      pendingTextMessages: [message, ...state.pendingTextMessages],
    }));
  },

  /**
   * Removes a pending text message by its client-generated ID.
   */
  removePendingText: (clientId) => {
    set((state) => ({
      pendingTextMessages: state.pendingTextMessages.filter(
        (pending) => pending.clientId !== clientId,
      ),
    }));
  },

  /**
   * Enqueues a sent text message's client ID into the conversation's FIFO tracking queue.
   */
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

  /**
   * Dequeues and returns the oldest sent client ID for a given conversation.
   */
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

  /**
   * Registers a new pending media upload (image/video).
   */
  addPendingMedia: (upload) => {
    set((state) => ({
      pendingMediaUploads: [upload, ...state.pendingMediaUploads],
    }));
  },

  /**
   * Updates progress or status attributes of an existing pending media upload.
   */
  updatePendingMedia: (clientId, patch) => {
    set((state) => ({
      pendingMediaUploads: state.pendingMediaUploads.map((item) =>
        item.clientId === clientId ? { ...item, ...patch } : item,
      ),
    }));
  },

  /**
   * Removes a pending media upload entry once sent or cancelled.
   */
  removePendingMedia: (clientId) => {
    set((state) => ({
      pendingMediaUploads: state.pendingMediaUploads.filter(
        (pending) => pending.clientId !== clientId,
      ),
    }));
  },

  /**
   * Registers a new pending file upload (document/attachment).
   */
  addPendingFile: (upload) => {
    set((state) => ({
      pendingFileUploads: [upload, ...state.pendingFileUploads],
    }));
  },

  /**
   * Updates progress or status attributes of an existing pending file upload.
   */
  updatePendingFile: (clientId, patch) => {
    set((state) => ({
      pendingFileUploads: state.pendingFileUploads.map((item) =>
        item.clientId === clientId ? { ...item, ...patch } : item,
      ),
    }));
  },

  /**
   * Removes a pending file upload entry once sent or cancelled.
   */
  removePendingFile: (clientId) => {
    set((state) => ({
      pendingFileUploads: state.pendingFileUploads.filter(
        (pending) => pending.clientId !== clientId,
      ),
    }));
  },

  /**
   * Reconciles pending text messages against confirmed server messages in FIFO order.
   * Removes pending entries whose content and timestamp match confirmed messages.
   */
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

  /**
   * Resets all pending text, media, and file state back to initial empty arrays.
   */
  reset: () => set(initialState),
}));
