import { z } from "zod";
import { SessionType } from "../session";

export const createSessionSchema = z.object({
  sessionType: z.enum(SessionType, {
    message: "Session type is required.",
  }),

  plannedStart: z
    .date({ message: "Planned start must be a valid date." })
    .refine((date) => date.getTime() > Date.now(), {
      message: "Planned start must be in the future.",
    }),

  plannedEnd: z.date({
    message: "Planned end must be a valid date.",
  }),
});

export type CreateSessionValidation = z.infer<typeof createSessionSchema>;
