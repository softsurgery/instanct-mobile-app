import { Paginated, QueryParams, ResponseMessageDto } from "~/types";
import axios from "../axios";

/**
 * Fetches a paginated list of messages for a specific conversation ID.
 * Supports pagination controls (page/limit), sorting, searching, and joins.
 */
const findPaginatedConversationMessages = async (
  id: number,
  {
    page = "1",
    limit = "5",
    sort,
    search = "",
    filter = "",
    join = "",
  }: QueryParams
): Promise<Paginated<ResponseMessageDto>> => {
  const params: { [key: string]: string } = {
    page,
    limit,
  };

  if (sort) params.sort = sort;
  if (search) params.search = search;
  if (filter) params.filter = filter;
  if (join) params.join = join;

  const response = await axios.get<Paginated<ResponseMessageDto>>(
    `/message/${id}/list`,
    {
      params,
    }
  );

  return response.data;
};

export const message = {
  findPaginatedConversationMessages,
};
