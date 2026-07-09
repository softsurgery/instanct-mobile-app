import {
  CreateConversationDto,
  CreateConversationReportDto,
  Paginated,
  QueryParams,
  ResponseConversationDto,
} from "~/types";
import axios from "../axios";

/**
 * Fetches a paginated list of chat conversations for the current authenticated user.
 * Supports searching, custom filtering, and relational joins.
 */
const findPaginatedUserConversations = async ({
  page = "1",
  limit = "5",
  sort,
  search = "",
  filter = "",
  join = "",
}: QueryParams): Promise<Paginated<ResponseConversationDto>> => {
  const params: { [key: string]: any } = {
    page,
    limit,
    sort,
  };

  if (search) params.search = search;
  if (filter) params.filter = filter;
  if (join) params.join = join;

  const response = await axios.get<Paginated<ResponseConversationDto>>(
    `/current-conversation/list`,
    {
      params,
    },
  );

  return response.data;
};

/**
 * Retrieves full details for a single conversation by ID, optionally joining related entities.
 */
const findById = async (
  id: number,
  join?: string,
): Promise<ResponseConversationDto> => {
  const response = await axios.get<ResponseConversationDto>(
    `/current-conversation/${id}`,
    {
      params: {
        join,
      },
    },
  );
  return response.data;
};

/**
 * Creates a new conversation with the specified list of user IDs.
 */
const createConversation = async (
  createConversation: CreateConversationDto,
): Promise<ResponseConversationDto> => {
  const response = await axios.post<ResponseConversationDto>(
    `/current-conversation`,
    createConversation,
  );
  return response.data;
};

/**
 * Permanently deletes an existing conversation by its ID.
 */
const deleteConversation = async (id: number): Promise<void> => {
  await axios.delete(`/current-conversation/${id}`);
};

/**
 * Blocks a specific user from interacting or sending messages to the current user.
 */
const blockUser = async (userId: string): Promise<void> => {
  await axios.post(`/user-block/${userId}`);
};

/**
 * Submits a moderation report against a specific conversation.
 */
const reportConversation = async (
  id: number,
  createConversationReportDto: CreateConversationReportDto,
): Promise<void> => {
  await axios.post(`/current-conversation/${id}/report`, createConversationReportDto);
};

const getUnreadCount = async (): Promise<number> => {
  const response = await axios.get<{ count: number }>(
    `/current-conversation/unread-count`,
  );
  return response.data.count;
};

export const conversation = {
  findPaginatedUserConversations,
  findById,
  createConversation,
  deleteConversation,
  blockUser,
  reportConversation,
  getUnreadCount,
};
