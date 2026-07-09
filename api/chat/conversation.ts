import {
  CreateConversationDto,
  CreateConversationReportDto,
  Paginated,
  QueryParams,
  ResponseConversationDto,
} from "~/types";
import axios from "../axios";

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

const createConversation = async (
  createConversation: CreateConversationDto,
): Promise<ResponseConversationDto> => {
  const response = await axios.post<ResponseConversationDto>(
    `/current-conversation`,
    createConversation,
  );
  return response.data;
};

const deleteConversation = async (id: number): Promise<void> => {
  await axios.delete(`/current-conversation/${id}`);
};

const blockUser = async (userId: string): Promise<void> => {
  await axios.post(`/user-block/${userId}`);
};

const reportConversation = async (
  id: number,
  createConversationReportDto: CreateConversationReportDto,
): Promise<void> => {
  await axios.post(`/current-conversation/${id}/report`, createConversationReportDto);
};

export const conversation = {
  findPaginatedUserConversations,
  findById,
  createConversation,
  deleteConversation,
  blockUser,
  reportConversation,
};
