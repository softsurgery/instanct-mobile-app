import {
  PageMeta,
  Paginated,
  QueryParams,
  ResponseConversationDto,
  ResponseMessageDto,
} from "@/types";

export const CONVERSATION_LINKS_MESSAGES_QUERY: QueryParams = {
  limit: "20",
  sort: "createdAt,DESC",
  join: "links",
};

export const conversationLinksMessagesQueryKey = (conversationId: number) =>
  ["messages", [], conversationId, CONVERSATION_LINKS_MESSAGES_QUERY] as const;

type MessagesInfiniteData = {
  pages: Paginated<ResponseMessageDto>[];
  pageParams: unknown[];
};

export const prependMessageToConversationLinksCache = (
  oldData: MessagesInfiniteData | undefined,
  message: ResponseMessageDto,
): MessagesInfiniteData | undefined => {
  if (!oldData?.pages?.length) {
    return oldData;
  }

  const firstPage = oldData.pages[0];
  if (firstPage.data.some((item) => item.id === message.id)) {
    return oldData;
  }

  return {
    ...oldData,
    pages: oldData.pages.map((page, index) =>
      index === 0 ? { ...page, data: [message, ...page.data] } : page,
    ),
  };
};

export const CONVERSATION_LIST_JOIN = [
  "participants",
  "participants.user",
  "lastMessage",
  "lastMessage.uploads",
  "lastMessage.uploads.upload",
].join(",");

export type InfiniteConversationData = {
  pages: {
    data: ResponseConversationDto[];
  }[];
  pageParams: PageMeta[];
};

export const replaceConversationInPages = (
  oldData: InfiniteConversationData | undefined,
  updated: ResponseConversationDto,
): InfiniteConversationData | undefined => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((conv) => (conv.id === updated.id ? updated : conv)),
    })),
  };
};

export const moveConversationToTop = (
  oldData: InfiniteConversationData | undefined,
  updated: ResponseConversationDto,
): InfiniteConversationData | undefined => {
  if (!oldData) return oldData;

  const allConversations = oldData.pages.flatMap((p) => p.data);

  const filtered = allConversations.filter((conv) => conv.id !== updated.id);

  const reordered = [updated, ...filtered];

  let cursor = 0;

  const rebuiltPages = oldData.pages.map((page) => {
    const pageSize = page.data.length;

    const data = reordered.slice(cursor, cursor + pageSize);

    cursor += pageSize;

    return {
      ...page,
      data,
    };
  });

  return {
    ...oldData,
    pages: rebuiltPages,
  };
};
