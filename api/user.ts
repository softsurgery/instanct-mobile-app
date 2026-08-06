import {
  Paginated,
  QueryParams,
  ResponseConfigurationNamespaceDto,
  ResponseUserDto,
  UpdateUserCoverDto,
  UpdateUserDto,
  UpdateUserMapConfigurationDto,
} from "@/types";
import axios from "./axios";
import { ResponseUserBookmarkDto } from "@/types/bookmark";

const findCurrent = async (): Promise<ResponseUserDto> => {
  const response = await axios.get<ResponseUserDto>(`/current-user`);
  return response.data;
};

const findById = async (
  id: string,
  query?: Pick<QueryParams, "join">,
): Promise<ResponseUserDto> => {
  const response = await axios.get<ResponseUserDto>(`/admin/user/${id}`, {
    params: query,
  });
  return response.data;
};

const findByUsername = async (
  username: string,
  query?: Pick<QueryParams, "join">,
): Promise<ResponseUserDto> => {
  const response = await axios.get<ResponseUserDto>(
    `/admin/user/username/${username}`,
    {
      params: query,
    },
  );
  return response.data;
};

const findByEmail = async (
  email: string,
  query?: Pick<QueryParams, "join">,
): Promise<ResponseUserDto> => {
  const response = await axios.get<ResponseUserDto>(
    `/admin/user/email/${email}`,
    {
      params: query,
    },
  );
  return response.data;
};

const updateCurrent = async (
  updateUserDto: UpdateUserDto,
): Promise<ResponseUserDto> => {
  const response = await axios.put(`/current-user`, updateUserDto);
  return response.data;
};

const updateCover = async (
  updateUserCoverDto: UpdateUserCoverDto,
): Promise<ResponseUserDto> => {
  const response = await axios.put(`/current-user/cover`, updateUserCoverDto);
  return response.data;
};

const findAll = async ({
  join = "",
}: Pick<QueryParams, "join">): Promise<ResponseUserDto[]> => {
  const response = await axios.get<ResponseUserDto[]>(`/admin/user/all`, {
    params: {
      join,
    },
  });
  return response.data;
};

const updateIndustries = async (
  id: string,
  industries: number[],
): Promise<ResponseUserDto> => {
  const response = await axios.put(`/admin/user/industries/${id}`, {
    industries,
  });
  return response.data;
};

const getCurrentMapConfiguration =
  async (): Promise<ResponseConfigurationNamespaceDto> => {
    const response = await axios.get(
      `/current-user/configurations/maps/current`,
    );
    return response.data;
  };

const getIndustries = async (id: string): Promise<number[] | null> => {
  const response = await axios.get(`/admin/user/industries/${id}`);
  return response.data;
};

const updateMapConfiguration = async (
  mapConfiguration: UpdateUserMapConfigurationDto,
): Promise<ResponseConfigurationNamespaceDto> => {
  const response = await axios.put(
    `/current-user/configuration/maps/current`,
    mapConfiguration,
  );
  return response.data;
};

const findPaginatedBookmarks = async ({
  page = "1",
  limit = "5",
  sort,
  search = "",
  filter = "",
  join = "",
}: QueryParams): Promise<Paginated<ResponseUserBookmarkDto>> => {
  const params: { [key: string]: any } = {
    page,
    limit,
    sort,
  };

  if (search) params.search = search;
  if (filter) params.filter = filter;
  if (join) params.join = join;

  const response = await axios.get<Paginated<ResponseUserBookmarkDto>>(
    `/current-user/bookmarks/list`,

    {
      params,
    },
  );

  return response.data;
};

const deleteCurrent = async (): Promise<ResponseUserDto> => {
  const response = await axios.delete<ResponseUserDto>(`/current-user`);
  return response.data;
};

export const user = {
  findAll,
  findCurrent,
  findById,
  findByEmail,
  findByUsername,
  updateCurrent,
  updateIndustries,
  updateCover,
  getIndustries,
  getCurrentMapConfiguration,
  updateMapConfiguration,
  findPaginatedBookmarks,
  deleteCurrent,
};
