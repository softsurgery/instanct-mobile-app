import { ResponseExperienceDto, UpdateExperienceDto } from "@/types";
import axios from "./axios";

const findByUserId = async (
  userId: string,
): Promise<ResponseExperienceDto[]> => {
  const response = await axios.get(`/experience/user/${userId}`);
  return response.data;
};

const update = async (
  id: number,
  experience: UpdateExperienceDto,
): Promise<ResponseExperienceDto> => {
  const response = await axios.put(`/experience/${id}`, experience);
  return response.data;
};

// DELETE /experience/:id (id is number)
const remove = async (id: number): Promise<ResponseExperienceDto> => {
  const response = await axios.delete(`/experience/${id}`);
  return response.data;
};

export const experience = {
  findByUserId,
  update,
  remove,
};
