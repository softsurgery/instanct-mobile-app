import { z } from "zod";
import { SessionType } from "../session";

export const createSessionSchema = z
  .object({
    sessionType: z.nativeEnum(SessionType, {
      message: "Session type is required.",
    }),

    plannedStart: z
      .preprocess(
        (value) =>
          value === null || value === undefined || value === ""
            ? undefined
            : new Date(value as string),
        z.date({ message: "Planned start must be a valid date." }),
      )
      .optional(),

    plannedEnd: z
      .preprocess(
        (value) =>
          value === null || value === undefined || value === ""
            ? undefined
            : new Date(value as string),
        z.date({ message: "Planned end must be a valid date." }),
      )
      .optional(),

    payload: z.record(z.unknown()).optional(),
  })
  .refine(
    (data) => {
      if (data.plannedStart && data.plannedEnd) {
        return data.plannedEnd > data.plannedStart;
      }
      return true;
    },
    {
      message: "Planned end must be after planned start.",
      path: ["plannedEnd"],
    },
  );

export type CreateSessionValidation = z.infer<typeof createSessionSchema>;
