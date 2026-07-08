import { ResponseMessageDto } from "~/types";

export const messageContentMatchesQuery = (
  message: ResponseMessageDto,
  query: string,
): boolean => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return false;

  return message.content?.toLowerCase().includes(normalizedQuery) ?? false;
};

export const filterMessagesByContentQuery = (
  messages: ResponseMessageDto[],
  query: string,
): ResponseMessageDto[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return messages.filter((message) =>
    messageContentMatchesQuery(message, normalizedQuery),
  );
};
