import { ResponseRefTypeDto } from "@/types";
import axios from "./axios";

const findIndustryByLabel = async (
  label: string
): Promise<ResponseRefTypeDto> => {
  const response = await axios.get<ResponseRefTypeDto>(
    `/reference-impl/industry/${label}`
  );
  return response.data;
};

const findAllIndustries = async (): Promise<ResponseRefTypeDto[]> => {
  const response = await axios.get<ResponseRefTypeDto[]>(
    `/reference-impl/industry`
  );
  return response.data;
};

const findAllIndustryParamsByLabel = async (
  label: string
): Promise<ResponseRefTypeDto[]> => {
  const response = await axios.get<ResponseRefTypeDto[]>(
    `/reference-impl/param/${label}/params`
  );
  return response.data;
};

const findObjectiveByLabel = async (
  label: string
): Promise<ResponseRefTypeDto> => {
  const response = await axios.get<ResponseRefTypeDto>(
    `/reference-impl/objectif/${label}`
  );
  return response.data;
};

const findAllObjectives = async (): Promise<ResponseRefTypeDto[]> => {
  const response = await axios.get<ResponseRefTypeDto[]>(
    `/reference-impl/objectif`
  );
  return response.data;
};

const findAllObjectiveParamsByLabel = async (
  label: string
): Promise<ResponseRefTypeDto[]> => {
  const response = await axios.get<ResponseRefTypeDto[]>(
    `/reference-impl/objectif/${label}/params`
  );
  return response.data;
};

export const refImpl = {
  //industry
  findIndustryByLabel,
  findAllIndustries,
  findAllIndustryParamsByLabel,
  //objective
  findObjectiveByLabel,
  findAllObjectives,
  findAllObjectiveParamsByLabel,
};
