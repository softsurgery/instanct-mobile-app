import { Paginated, QueryParams } from "@/types";
import { CreateSessionDto, ResponseSessionDto } from "@/types/session";
import axios from "./axios";

const findAllPaginated = async ({
  page = "1",
  limit = "5",
  sort,
  search = "",
  filter = "",
  join = "",
}: QueryParams): Promise<Paginated<ResponseSessionDto>> => {
  const params: { [key: string]: any } = {
    page,
    limit,
    sort,
  };

  if (search) params.search = search;
  if (filter) params.filter = filter;
  if (join) params.join = join;

  const response = await axios.get<Paginated<ResponseSessionDto>>(
    `/notification/list`,
    {
      params,
    },
  );

  return response.data;
};

const findAll = async ({
  join = "",
}: Pick<QueryParams, "join">): Promise<ResponseSessionDto[]> => {
  const response = await axios.get<ResponseSessionDto[]>(
    `/current-session/all`,
    {
      params: {
        join,
      },
    },
  );
  return response.data;
};

const findAllActivePaginated = async ({
  page = "1",
  limit = "5",
  sort,
  search = "",
  filter = "",
  join = "",
}: QueryParams): Promise<Paginated<ResponseSessionDto>> => {
  const params: { [key: string]: any } = {
    page,
    limit,
    sort,
  };

  if (search) params.search = search;
  if (filter) params.filter = filter;
  if (join) params.join = join;

  const response = await axios.get<Paginated<ResponseSessionDto>>(
    `/current-session/active-list`,
    {
      params,
    },
  );

  return response.data;
};

const findAllActive = async ({
  join = "",
}: Pick<QueryParams, "join">): Promise<ResponseSessionDto[]> => {
  const response = await axios.get<ResponseSessionDto[]>(
    `/current-session/active-all`,
    {
      params: {
        join,
      },
    },
  );
  return response.data;
};

const start = async (
  createSessionDto: CreateSessionDto,
): Promise<ResponseSessionDto> => {
  const response = await axios.post<ResponseSessionDto>(
    `/current-session/start`,
    createSessionDto,
  );
  return response.data;
};

export const session = {
  findAllPaginated,
  findAll,
  findAllActivePaginated,
  findAllActive,
  start,
};
