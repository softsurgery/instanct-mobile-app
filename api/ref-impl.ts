import { ResponseRefParamDto } from "@/types";
import axios from "./axios";

const findAllIndustries = async (): Promise<ResponseRefParamDto[]> => {
  const response = await axios.get<ResponseRefParamDto[]>(
    `/reference-impl/industries`,
  );
  return response.data;
};

const findAllObjectives = async (): Promise<ResponseRefParamDto[]> => {
  const response = await axios.get<ResponseRefParamDto[]>(
    `/reference-impl/objectives`,
  );
  return response.data;
};

export const refImpl = {
  //industry
  findAllIndustries,
  //objective
  findAllObjectives,
};
