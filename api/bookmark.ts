import { ResponseUserBookmarkDto } from "@/types/bookmark";
import axios from "./axios";

const findBookmark = async (id: string): Promise<ResponseUserBookmarkDto> => {
  const response = await axios.get(`/user-bookmark/${id}`);
  return response.data;
};

const saveBookmark = async (id: string): Promise<ResponseUserBookmarkDto> => {
  const response = await axios.post(`/user-bookmark/${id}`, {});
  return response.data;
};

const deleteBookmark = async (id: string): Promise<ResponseUserBookmarkDto> => {
  const response = await axios.delete(`/user-bookmark/${id}`);
  return response.data;
};

export const bookmark = {
  findBookmark,
  saveBookmark,
  deleteBookmark,
};
