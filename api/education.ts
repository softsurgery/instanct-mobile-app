import { ResponseEducationDto } from "@/types";
import axios from "./axios";

const findByUserId = async (
  userId: string,
): Promise<ResponseEducationDto[]> => {
  const response = await axios.get(`/education/user/${userId}`);
  return response.data;
};

export const education = {
  findByUserId,
};
