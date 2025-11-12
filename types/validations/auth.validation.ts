import { z } from "zod";

export const requestSignInDtoSchema = z.object({
  email: z
    .string({
      error: "Email is required.",
    })
    .min(3, {
      message: "Email must be at least 3 characters long.",
    })
    .max(255, {
      message: "Email must be at most 255 characters long.",
    }),
  password: z
    .string({
      error: "Password is required.",
    })
    .min(8, {
      error: "Password must be at least 8 characters long.",
    })
    .max(32, {
      error: "Password must be at most 32 characters long.",
    }),
});

export const requestSignUpDtoSchema = z
  .object({
    firstName: z
      .string({
        error: "First name is required.",
      })
      .min(3, { message: "First name must be at least 3 characters long." })
      .max(50, { message: "First name must be at most 50 characters long." }),
    lastName: z
      .string({
        error: "Last name is required.",
      })
      .min(3, { message: "Last name must be at least 3 characters long." })
      .max(50, { message: "Last name must be at most 50 characters long." }),
    email: z
      .string({
        error: "Email is required.",
      })
      .min(3, { message: "Email must be at least 3 characters long." })
      .max(255, { message: "Email must be at most 255 characters long." })
      .email({ message: "Email must be a valid email address." }),

    username: z
      .string({
        error: "Username is required.",
      })
      .min(3, { message: "Username must be at least 3 characters long." })
      .max(50, { message: "Username must be at most 50 characters long." }),

    password: z
      .string({
        error: "Password is required.",
      })
      .min(8, { message: "Password must be at least 8 characters long." })
      .max(32, { message: "Password must be at most 32 characters long." }),

    confirmPassword: z
      .string({
        error: "Confirm password is required.",
      })
      .min(8, {
        message: "Confirm password must be at least 8 characters long.",
      })
      .max(32, {
        message: "Confirm password must be at most 32 characters long.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  });
