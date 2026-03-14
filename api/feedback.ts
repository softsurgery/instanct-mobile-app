import axios from "./axios";
import { CreateFeedbackDto } from "~/types";

async function create(createFeedbackDto: CreateFeedbackDto) {
  const response = await axios.post("feedback", createFeedbackDto);
  return response.data;
}

export const feedback = {
  create,
};
