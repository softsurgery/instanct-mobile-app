import { z } from "zod";

const baseEducationSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Title must be at least 2 characters long",
    })
    .max(100, {
      message: "Title must not exceed 100 characters",
    }),
  institution: z
    .string()
    .min(2, {
      message: "Institution name must be at least 2 characters long",
    })
    .max(100, {
      message: "Institution name must not exceed 100 characters",
    }),
  startDate: z
    .preprocess(
      (value) =>
        value === null || value === "" ? null : new Date(value as string),
      z.date({
        message: "Start date is required",
      }),
    )
    .refine(
      (date) => {
        if (!date) return false;
        return date <= new Date();
      },
      {
        message: "Start date cannot be in the future",
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
      message: "Description must not exceed 500 characters",
    })
    .optional(),
});

const createEducationSchema = baseEducationSchema
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
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
      message: "End date cannot be in the future",
      path: ["endDate"],
    },
  );

const updateEducationSchema = baseEducationSchema
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
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
      message: "End date cannot be in the future",
      path: ["endDate"],
    },
  );

export { baseEducationSchema, createEducationSchema, updateEducationSchema };
