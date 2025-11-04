import { ResponseClientDto, UpdateClientDto } from "~/types";
import axios from "./axios";

const findCurrent = async (): Promise<ResponseClientDto> => {
  const response = await axios.get<ResponseClientDto>(`/client/current`);
  return response.data;
};

const findById = async (id: string): Promise<ResponseClientDto> => {
  const response = await axios.get<ResponseClientDto>(`/client/${id}`);
  return response.data;
};

const updateCurrent = async (
  updateClientDto: UpdateClientDto
): Promise<ResponseClientDto> => {
  const response = await axios.put(`/client`, updateClientDto);
  return response.data;
};

export const client = {
  findCurrent,
  findById,
  updateCurrent,
};
