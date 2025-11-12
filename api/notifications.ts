import { Paginated, QueryParams } from "~/types";
import { ResponseNotificationDto } from "~/types/notifications";
import axios from "./axios";

const findPaginatedUserConversations = async ({
  page = "1",
  limit = "5",
  sort,
  search = "",
  filter = "",
  join = "",
}: QueryParams): Promise<Paginated<ResponseNotificationDto>> => {
  const params: { [key: string]: any } = {
    page,
    limit,
    sort,
  };

  if (search) params.search = search;
  if (filter) params.filter = filter;
  if (join) params.join = join;

  const response = await axios.get<Paginated<ResponseNotificationDto>>(
    `/notification/list`,
    {
      params,
    }
  );

  return response.data;
};

export const notifications = {
  findPaginatedUserConversations,
};
