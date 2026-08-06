import { z } from "zod";

// Messages are translation keys, resolved by the consumer in the "menu"
// namespace (see useCreateEducationFormStructure / useUpdateEducationFormStructure).
const dateOrNull = z.preprocess(
  (value) =>
    value === null || value === "" ? null : new Date(value as string),
  z.date().nullable(),
);

const baseEducationSchema = z.object({
  title: z
    .string()
    .min(2, { error: "education.validation.titleTooShort" })
    .max(255, { error: "education.validation.titleTooLong" }),
  institution: z
    .string()
    .min(2, { error: "education.validation.institutionTooShort" })
    .max(100, { error: "education.validation.institutionTooLong" }),
  startDate: dateOrNull
    .refine((date) => date === null || date <= new Date(), {
      error: "education.validation.startDateInFuture",
    })
    .optional(),
  endDate: dateOrNull.optional(),
  description: z
    .string()
    .max(500, { error: "education.validation.descriptionTooLong" })
    .optional(),
});

const dateRefinements = (schema: typeof baseEducationSchema) =>
  schema
    .refine(
      (data) => {
        if (data.endDate && data.startDate) {
          return data.endDate > data.startDate;
        }
        return true;
      },
      { error: "education.validation.endDateBeforeStart", path: ["endDate"] },
    )
    .refine(
      (data) => {
        if (data.endDate) {
          return data.endDate <= new Date();
        }
        return true;
      },
      { error: "education.validation.endDateInFuture", path: ["endDate"] },
    );

const createEducationSchema = dateRefinements(baseEducationSchema);
const updateEducationSchema = dateRefinements(baseEducationSchema);

export { baseEducationSchema, createEducationSchema, updateEducationSchema };
