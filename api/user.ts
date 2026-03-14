import {
  QueryParams,
  ResponseConfigurationNamespaceDto,
  ResponseUserDto,
  UpdateUserDto,
  UpdateUserMapConfigurationDto,
} from "@/types";
import axios from "./axios";

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

const updateCurrent = async (
  updateUserDto: UpdateUserDto,
): Promise<ResponseUserDto> => {
  const response = await axios.put(`/current-user`, updateUserDto);
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

const updateObjectives = async (
  id: string,
  objectives: number[],
): Promise<ResponseUserDto> => {
  const response = await axios.put(`/admin/user/objectives/${id}`, {
    objectives,
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

const getObjectives = async (id: string): Promise<number[] | null> => {
  const response = await axios.get(`/admin/user/objectives/${id}`);
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

export const user = {
  findAll,
  findCurrent,
  findById,
  updateCurrent,
  updateIndustries,
  updateObjectives,
  getIndustries,
  getObjectives,
  getCurrentMapConfiguration,
  updateMapConfiguration,
};
