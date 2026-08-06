import { z } from "zod";
import { ConversationReportReason } from "@/types";

export const ConversationReportReasonEnum = z.enum(
  Object.values(ConversationReportReason) as [string, ...string[]],
  {
    error: "chat.report.validation.reasonRequired",
  },
);

export const createConversationReportSchema = z.object({
  reason: ConversationReportReasonEnum,
  description: z
    .string({ error: "chat.report.validation.descriptionRequired" })
    .min(10, { error: "chat.report.validation.descriptionTooShort" })
    .max(1024, {
      error: "chat.report.validation.descriptionTooLong",
    }),
});
