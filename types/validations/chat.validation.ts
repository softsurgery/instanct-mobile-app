import { z } from "zod";
import { ConversationReportReason } from "@/types";

export const ConversationReportReasonEnum = z.enum(
  Object.values(ConversationReportReason) as [string, ...string[]],
  {
    error: () => ({ message: "You must select a reason." }),
  },
);

export const createConversationReportSchema = z.object({
  reason: ConversationReportReasonEnum,
  description: z
    .string({ error: "Description is required." })
    .min(10, { message: "Description must be at least 10 characters long." })
    .max(1024, {
      message: "Description must be at most 1024 characters long.",
    }),
});
