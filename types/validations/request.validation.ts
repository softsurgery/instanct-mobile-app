import { z } from "zod";

export const CreateRequestDtoSchema = (mention: boolean) =>
  z.object({
    receiversIds: z
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

    time: mention
      ? z.coerce.date({
          message: "Time is required.",
        })
      : z.coerce.date().optional(),
  });
