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
    })
    .optional(),

  plannedEnd: z.date({
    message: "Planned end must be a valid date.",
  }),
  payload: z.object({
    objectives: z
      .array(z.string({ message: "Objective must be a string." }))
      .min(1, { message: "At least one objective must be selected." })
      .optional(),
  }),
});

export type CreateSessionValidation = z.infer<typeof createSessionSchema>;
