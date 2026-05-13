import { PageMeta, ResponseConversationDto } from "@/types";

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
