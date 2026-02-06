import { ResponseUserDto, UpdateUserDto } from "@/types";
import axios from "./axios";

const findCurrent = async (): Promise<ResponseUserDto> => {
  const response = await axios.get<ResponseUserDto>(`/admin/user/current`);
  return response.data;
};

const findById = async (id: string): Promise<ResponseUserDto> => {
  const response = await axios.get<ResponseUserDto>(`/admin/user/${id}`);
  return response.data;
};

const updateCurrent = async (
  updateUserDto: UpdateUserDto,
): Promise<ResponseUserDto> => {
  const response = await axios.put(`/admin/user/current`, updateUserDto);
  return response.data;
};

const findAll = async (): Promise<ResponseUserDto[]> => {
  const response = await axios.get<ResponseUserDto[]>(`/admin/user/all`);
  return response.data;
};

export const user = {
  findAll,
  findCurrent,
  findById,
  updateCurrent,
};
