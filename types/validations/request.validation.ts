import { z } from "zod";

export const CreateRequestDtoSchema = (mention: boolean) =>
  z.object({
    receiverIds: z
      .array(z.string())
      .min(1, "At least one receiver is required"),

    message: z
      .string({
        message: "Message must be a string.",
      })
      .min(1, "Message cannot be empty."),

    location: mention
      ? z.string().min(1, "Location is required.")
      : z.string().optional(),

    latitude: mention
      ? z.number({ message: "Location coordinates are required." })
      : z.number().optional(),

    longitude: mention
      ? z.number({ message: "Location coordinates are required." })
      : z.number().optional(),

    time: mention
      ? z.date({
          message: "Time is required.",
        })
      : z.date().optional(),
  });
