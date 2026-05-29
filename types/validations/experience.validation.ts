import { z } from "zod";
import { LocationTypes, WorkTypes } from "../user-management";

const baseExperienceSchema = z.object({
  title: z
    .string({
      message: "Title is required.",
    })
    .min(1, {
      message: "Title cannot be empty.",
    })
    .max(50, {
      message: "Title cannot exceed 50 characters.",
    }),

  company: z
    .string({
      message: "Company name is required.",
    })
    .min(1, {
      message: "Company name cannot be empty.",
    })
    .max(50, {
      message: "Company name cannot exceed 50 characters.",
    }),

  startDate: z
    .preprocess(
      (value) =>
        value === null || value === "" ? null : new Date(value as string),
      z.date({
        message: "Start date is required.",
      }),
    )
    .refine(
      (date) => {
        if (!date) return false;
        return date <= new Date();
      },
      {
        message: "Start date cannot be in the future.",
      },
    ),
  location: z
    .string()
    .max(50, {
      message: "Location cannot exceed 50 characters.",
    })
    .optional(),

  workType: z.nativeEnum(WorkTypes, {
    error: "You must select a valid work type",
  }),
  locationType: z.nativeEnum(LocationTypes, {
    error: "You must select a valid location type",
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
      message: "End date must be after the start date.",
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
      message: "End date cannot be in the future.",
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
      message: "End date must be after the start date.",
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
      message: "End date cannot be in the future.",
      path: ["endDate"],
    },
  );

export { baseExperienceSchema, createExperienceSchema, updateExperienceSchema };
