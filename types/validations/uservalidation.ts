import { z } from "zod";

const baseUserSchema = z.object({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "userManagement.validation.invalidUsernameFormat",
    })
    .min(3, {
      message: "userManagement.validation.invalidUsernameLength",
    }),
  email: z
    .string()
    .email({ message: "userManagement.validation.invalidEmail" }),

  firstName: z
    .string()
    .min(3, {
      message: "userManagement.validation.invalidFirstNameLength",
    })
    .max(25, {
      message: "userManagement.validation.firstNameTooLong",
    })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "userManagement.validation.invalidFirstNameFormat",
    }),
  lastName: z
    .string()
    .min(3, {
      message: "userManagement.validation.invalidLastNameLength",
    })
    .max(25, { message: "userManagement.validation.lastNameTooLong" })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "userManagement.validation.invalidLastNameFormat",
    }),
  dateOfBirth: z
    .preprocess(
      (value) =>
        value === null || value === "" ? null : new Date(value as string),
      z.union([z.date(), z.null()]).refine(
        (birthDate) => {
          if (!birthDate) return true;

          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const isBirthdayPassed =
            today.getMonth() > birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() &&
              today.getDate() >= birthDate.getDate());

          return age > 13 || (age === 13 && isBirthdayPassed);
        },
        { message: "userManagement.validation.invalidAge" },
      ),
    )
    .optional(),
});

function updateUserSchema() {
  return baseUserSchema.extend({
    roleId: z.string({
      message: "userManagement.validation.roleRequired",
    }),
  });
}

export { updateUserSchema };
