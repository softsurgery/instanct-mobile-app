import { Paginated, QueryParams, ResponseConversationDto } from "~/types";
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
    `/conversation/list`,
    {
      params,
    }
  );

  return response.data;
};

const findById = async (id: number): Promise<ResponseConversationDto> => {
  const response = await axios.get<ResponseConversationDto>(
    `/conversation/${id}`
  );
  return response.data;
};

export const conversation = {
  findPaginatedUserConversations,
  findById,
};
