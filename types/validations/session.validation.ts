import { z } from "zod";
import { SessionType } from "../session";

// Messages are translation keys, resolved by the consumer in the "explore"
// namespace (see useSessionStarterFormStructure / useSessionManagementFormStructure).
export const createSessionSchema = (now: boolean) => {
  return z
    .object({
      sessionType: z.enum(SessionType, {
        error: "session.validation.sessionTypeRequired",
      }),

      plannedStart: z
        .date({ error: "session.validation.invalidPlannedStart" })
        .optional()
        .refine(
          (date) => {
            if (now) return true; // skip check if now
            return !!date && date.getTime() > Date.now();
          },
          {
            error: "session.validation.plannedStartInPast",
          },
        ),

      // plannedEnd is always required
      plannedEnd: z.date({ error: "session.validation.invalidPlannedEnd" }),

      payload: z.object({
        objectives: z
          .array(z.number({ error: "session.validation.invalidObjective" }))
          .min(1, { error: "session.validation.objectivesRequired" })
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
        error: "session.validation.plannedEndBeforeStart",
        path: ["plannedEnd"],
      },
    );
};

export const updateSessionSchema = z.object({
  plannedEnd: z
    .date({ error: "session.validation.invalidPlannedEnd" })
    .optional(),

  payload: z.object({
    objectives: z
      .array(z.number({ error: "session.validation.invalidObjective" }))
      .min(1, { error: "session.validation.objectivesRequired" })
      .optional(),
  }),
});
