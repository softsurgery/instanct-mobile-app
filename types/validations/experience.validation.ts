import { z } from "zod";
import { LocationTypes, WorkTypes } from "../user-management";

// Messages are translation keys, resolved by the consumer in the "menu"
// namespace (see useCreateExperienceFormStructure / useUpdateExperienceFormStructure).
const baseExperienceSchema = z.object({
  title: z
    .string({
      error: "experience.validation.titleRequired",
    })
    .min(1, {
      error: "experience.validation.titleEmpty",
    })
    .max(255, {
      error: "experience.validation.titleTooLong",
    }),

  company: z
    .string({
      error: "experience.validation.companyRequired",
    })
    .min(1, {
      error: "experience.validation.companyEmpty",
    })
    .max(50, {
      error: "experience.validation.companyTooLong",
    }),

  startDate: z
    .preprocess(
      (value) =>
        value === null || value === "" ? null : new Date(value as string),
      z.date({
        error: "experience.validation.startDateRequired",
      }),
    )
    .refine(
      (date) => {
        if (!date) return false;
        return date <= new Date();
      },
      {
        error: "experience.validation.startDateInFuture",
      },
    ),
  location: z
    .string()
    .max(50, {
      error: "experience.validation.locationTooLong",
    })
    .optional(),

  workType: z.nativeEnum(WorkTypes, {
    error: "experience.validation.invalidWorkType",
  }),
  locationType: z.nativeEnum(LocationTypes, {
    error: "experience.validation.invalidLocationType",
  }),
  endDate: z
    .preprocess(
      (value) =>
        value === null || value === "" ? null : new Date(value as string),
      z.union([z.date(), z.null()]),
    )
    .optional(),

  description: z.string().optional(),
});

const createExperienceSchema = baseExperienceSchema
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      error: "experience.validation.endDateBeforeStart",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate <= new Date();
      }
      return true;
    },
    {
      error: "experience.validation.endDateInFuture",
      path: ["endDate"],
    },
  );

const updateExperienceSchema = baseExperienceSchema
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      error: "experience.validation.endDateBeforeStart",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate <= new Date();
      }
      return true;
    },
    {
      error: "experience.validation.endDateInFuture",
      path: ["endDate"],
    },
  );

export { baseExperienceSchema, createExperienceSchema, updateExperienceSchema };
