import { z } from "zod";
import { SessionType } from "../session";

export const createSessionSchema = (now: boolean) => {
  return z
    .object({
      sessionType: z.enum(SessionType, {
        message: "Session type is required.",
      }),

      plannedStart: z
        .date({ message: "Planned start must be a valid date." })
        .optional()
        .refine(
          (date) => {
            if (now) return true; // skip check if now
            return !!date && date.getTime() > Date.now();
          },
          {
            message: "Planned start must be in the future.",
          },
        ),

      // plannedEnd is always required
      plannedEnd: z.date({ message: "Planned end must be a valid date." }),

      payload: z.object({
        objectives: z
          .array(z.number({ message: "Objective must be a number." }))
          .min(1, { message: "At least one objective must be selected." })
          .optional(),
      }),
    })
    .refine(
      (data) => {
        if (data.plannedStart) {
          return data.plannedEnd > data.plannedStart;
        }
        return true;
      },
      {
        message: "Planned end must be after planned start.",
        path: ["plannedEnd"],
      },
    );
};

export const updateSessionSchema = z.object({
  plannedEnd: z
    .date({ message: "Planned end must be a valid date." })
    .optional(),

  payload: z.object({
    objectives: z
      .array(z.number({ message: "Objective must be a number." }))
      .min(1, { message: "At least one objective must be selected." })
      .optional(),
  }),
});
