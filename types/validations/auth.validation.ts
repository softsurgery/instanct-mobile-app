import { z } from "zod";

// Messages are translation keys, resolved by the consumer (see
// useSigninFormStructure / useSignupFormStructure) in the "auth" namespace.
// Keep the character bounds below in sync with the auth.validation.min/max
// strings in i18n/locales/*/auth.json.
export const requestSignInDtoSchema = z.object({
  email: z
    .string({
      error: "auth.validation.required.email",
    })
    .min(3, {
      error: "auth.validation.min.email",
    })
    .max(255, {
      error: "auth.validation.max.email",
    }),
  password: z
    .string({
      error: "auth.validation.required.password",
    })
    .min(8, {
      error: "auth.validation.min.password",
    })
    .max(32, {
      error: "auth.validation.max.password",
    }),
});

export const requestSignUpDtoSchema = z
  .object({
    firstName: z
      .string({
        error: "auth.validation.required.firstName",
      })
      .min(3, { error: "auth.validation.min.firstName" })
      .max(50, { error: "auth.validation.max.firstName" }),
    lastName: z
      .string({
        error: "auth.validation.required.lastName",
      })
      .min(3, { error: "auth.validation.min.lastName" })
      .max(50, { error: "auth.validation.max.lastName" }),
    email: z
      .string({
        error: "auth.validation.required.email",
      })
      .min(3, { error: "auth.validation.min.email" })
      .max(255, { error: "auth.validation.max.email" })
      .email({ error: "auth.validation.invalid.email" }),

    username: z
      .string({
        error: "auth.validation.required.username",
      })
      .min(3, { error: "auth.validation.min.username" })
      .max(50, { error: "auth.validation.max.username" }),

    password: z
      .string({
        error: "auth.validation.required.password",
      })
      .min(8, { error: "auth.validation.min.password" })
      .max(32, { error: "auth.validation.max.password" }),

    confirmPassword: z
      .string({
        error: "auth.validation.required.confirmPassword",
      })
      .min(8, {
        error: "auth.validation.min.confirmPassword",
      })
      .max(32, {
        error: "auth.validation.max.confirmPassword",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "auth.validation.passwordsMismatch",
  });
