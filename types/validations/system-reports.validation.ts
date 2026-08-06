import { z } from "zod";
import { BugVariant, FeedbackCategory } from "@/types";

// Messages are translation keys, resolved by the consumer in the "settings"
// namespace (see useBugReportFormStructure / useSendFeedbackFormStructure).
const BUG = "settings.support.screens.report-bug.validation";
const FEEDBACK = "settings.support.screens.send-feedback.validation";

export const BugVariantEnum = z.enum(
  Object.values(BugVariant) as [string, ...string[]],
  {
    error: `${BUG}.variantRequired`,
  },
);

export const createBugSchema = z.object({
  variant: BugVariantEnum,
  title: z
    .string({ error: `${BUG}.titleRequired` })
    .min(10, { error: `${BUG}.titleTooShort` })
    .max(255, { error: `${BUG}.titleTooLong` }),
  description: z
    .string({ error: `${BUG}.descriptionRequired` })
    .min(10, { error: `${BUG}.descriptionTooShort` })
    .max(1024, {
      error: `${BUG}.descriptionTooLong`,
    }),
});

export const FeedbackCategoryEnum = z.enum(
  Object.values(FeedbackCategory) as [string, ...string[]],
  {
    error: `${FEEDBACK}.categoryRequired`,
  },
);

export const createFeedbackSchema = z.object({
  category: FeedbackCategoryEnum,
  message: z
    .string({ error: `${FEEDBACK}.messageRequired` })
    .min(10, { error: `${FEEDBACK}.messageTooShort` })
    .max(1024, {
      error: `${FEEDBACK}.messageTooLong`,
    }),
  rating: z.number().min(1, { error: `${FEEDBACK}.ratingRequired` }),
});
