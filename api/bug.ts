import axios from "./axios";
import { CreateBugDto } from "~/types";

async function create(createBugDto: CreateBugDto) {
  const response = await axios.post("bug", createBugDto);
  return response.data;
}

export const bug = {
  create,
};
