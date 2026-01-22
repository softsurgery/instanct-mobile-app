import { ResponseExperienceDto } from "@/types";
import axios from "./axios";

const findByUserId = async (
  userId: string,
): Promise<ResponseExperienceDto[]> => {
  const response = await axios.get(`/experience/user/${userId}`);
  return response.data;
};

export const experience = {
  findByUserId,
};
