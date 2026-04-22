import { Paginated, QueryParams, ResponseRefTypeDto } from "~/types";
import axios from "../axios";

const findPaginated = async ({
  page = "1",
  limit = "5",
  sort,
  search = "",
  filter = "",
  join = "",
}: QueryParams): Promise<Paginated<ResponseRefTypeDto>> => {
  const params: { [key: string]: any } = {
    page,
    limit,
    sort,
  };

  if (search) params.search = search;
  if (filter) params.filter = filter;
  if (join) params.join = join;

  const response = await axios.get<Paginated<ResponseRefTypeDto>>(
    `/ref-type/list`,
    {
      params,
    },
  );

  return response.data;
};

const findAll = async ({
  sort,
  search = "",
  filter = "",
  join = "",
}: QueryParams): Promise<ResponseRefTypeDto[]> => {
  const params: { [key: string]: any } = {
    sort,
  };

  if (search) params.search = search;
  if (filter) params.filter = filter;
  if (join) params.join = join;

  const response = await axios.get<ResponseRefTypeDto[]>(`/ref-type/all`, {
    params,
  });
  return response.data;
};

const findById = async (id: string): Promise<ResponseRefTypeDto> => {
  const response = await axios.get<ResponseRefTypeDto>(`/ref-type/${id}`);
  return response.data;
};

export const refType = {
  findPaginated,
  findAll,
  findById,
};
