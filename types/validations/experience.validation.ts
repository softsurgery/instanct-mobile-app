import { z } from "zod";

const baseExperienceSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Title must be at least 2 characters long.",
    })
    .max(100, {
      message: "Title cannot exceed 100 characters.",
    }),

  company: z
    .string()
    .min(2, {
      message: "Company name must be at least 2 characters long.",
    })
    .max(100, {
      message: "Company name cannot exceed 100 characters.",
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

  endDate: z
    .preprocess(
      (value) =>
        value === null || value === "" ? null : new Date(value as string),
      z.union([z.date(), z.null()]),
    )
    .optional(),

  description: z
    .string()
    .max(500, {
      message: "Description cannot exceed 500 characters.",
    })
    .optional(),
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
