import {
  CreateEducationDto,
  ResponseEducationDto,
  UpdateEducationDto,
} from "@/types";
import axios from "./axios";

const findByUserId = async (
  userId: string,
): Promise<ResponseEducationDto[]> => {
  const response = await axios.get(`/education/user/${userId}`);
  return response.data;
};

const create = async (
  userId: string,
  education: CreateEducationDto,
): Promise<ResponseEducationDto> => {
  const response = await axios.post(`/education/user/${userId}`, education);
  return response.data;
};

const update = async (
  id: number,
  education: UpdateEducationDto,
): Promise<ResponseEducationDto> => {
  const response = await axios.put(`/education/${id}`, education);
  return response.data;
};

const remove = async (id: number): Promise<ResponseEducationDto> => {
  const response = await axios.delete(`/education/${id}`);
  return response.data;
};

export const education = {
  findByUserId,
  create,
  update,
  remove,
};
