import {
  CreateRequestDto,
  Paginated,
  QueryParams,
  ResponseRequestDto,
} from "@/types";
import axios from "./axios";

const findAllPaginated = async ({
  page = "1",
  limit = "5",
  sort,
  search = "",
  filter = "",
  join = "session",
}: QueryParams): Promise<Paginated<ResponseRequestDto>> => {
  const params: { [key: string]: any } = {
    page,
    limit,
    sort,
  };

  if (search) params.search = search;
  if (filter) params.filter = filter;
  if (join) params.join = join;

  const response = await axios.get<Paginated<ResponseRequestDto>>(
    `/requests/list`,
    {
      params,
    },
  );

  return response.data;
};

const findAllIncomingPaginated = async ({
  page = "1",
  limit = "5",
  sort,
  search = "",
  filter = "",
  join = "",
}: QueryParams): Promise<Paginated<ResponseRequestDto>> => {
  const params: { [key: string]: any } = {
    page,
    limit,
    sort,
  };

  if (search) params.search = search;
  if (filter) params.filter = filter;
  if (join) params.join = join;

  const response = await axios.get<Paginated<ResponseRequestDto>>(
    `/requests/incoming/list`,
    {
      params,
    },
  );

  return response.data;
};

const findAllOutgoingPaginated = async ({
  page = "1",
  limit = "5",
  sort,
  search = "",
  filter = "",
  join = "",
}: QueryParams): Promise<Paginated<ResponseRequestDto>> => {
  const params: { [key: string]: any } = {
    page,
    limit,
    sort,
  };

  if (search) params.search = search;
  if (filter) params.filter = filter;
  if (join) params.join = join;

  const response = await axios.get<Paginated<ResponseRequestDto>>(
    `/requests/outgoing/list`,
    {
      params,
    },
  );

  return response.data;
};

const findOneById = async (
  id: string,
  join: string,
): Promise<ResponseRequestDto> => {
  const response = await axios.get<ResponseRequestDto>(`/requests/${id}`, {
    params: { join },
  });
  return response.data;
};

const send = async (
  createRequestDto: CreateRequestDto,
): Promise<ResponseRequestDto> => {
  const response = await axios.post<ResponseRequestDto>(
    `/requests`,
    createRequestDto,
  );
  return response.data;
};

export const request = {
  findAllPaginated,
  findOneById,
  findAllIncomingPaginated,
  findAllOutgoingPaginated,
  send,
};
