import { Store } from "@/types";
import axios from "./axios";

const findById = async (id: string): Promise<Store> => {
  const response = await axios.get<Store>(`/store/${id}`);
  return response.data;
};

export const store = {
  findById,
};
