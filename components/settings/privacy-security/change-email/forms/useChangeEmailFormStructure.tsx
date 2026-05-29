import { UserStore } from "@/stores/useUserStore";
import {
  Field,
  FieldVariant,
  FormStructure,
  EmailFieldProps,
  PasswordFieldProps,
} from "~/components/shared/form-builder/types";

interface UseChangeEmailFormStructureProps {
  store: UserStore;
}

export const useChangeEmailFormStructure = ({
  store,
}: UseChangeEmailFormStructureProps) => {
  const currentEmailField: Field<EmailFieldProps> = {
    id: "currentEmail",
    label: "Current Email",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Enter your current Email",
    description: "Use the Email associated with your account.",
  };

  const passwordField: Field<PasswordFieldProps> = {
    id: "currentPassword",
    label: "Current Password",
    variant: FieldVariant.PASSWORD,
    required: true,
    placeholder: "Enter your current password",
    description: "Use the password associated with your account.",
  };

  const verifyFormStructure: FormStructure = {
    title: "Verify User Identity",
    fieldsets: [
      {
        rows: [
          {
            id: 1,
            fields: [currentEmailField],
          },
          {
            id: 2,
            fields: [passwordField],
          },
        ],
      },
    ],
  };

  const newEmailField: Field<EmailFieldProps> = {
    id: "newEmail",
    label: "New Email",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Enter your new Email",
    description:
      "Choose a stronger Email that is different from the one you already use.",
  };

  const confirmEmailField: Field<EmailFieldProps> = {
    id: "confirmEmail",
    label: "Confirm Email",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Re-enter your new Email",
    description: "Repeat the new Email to make sure it matches.",
  };

  const updateFormStructure: FormStructure = {
    title: "Update Email",
    fieldsets: [
      {
        rows: [
          {
            id: 1,
            fields: [newEmailField],
          },
          {
            id: 2,
            fields: [confirmEmailField],
          },
        ],
      },
    ],
  };

  const otpField: Field<PasswordFieldProps> = {
    id: "otp",
    label: "Verification Code",
    variant: FieldVariant.PASSWORD,
    required: true,
    placeholder: "0 0 0 0 0 0",
    description: "Use the code we sent to your email to verify your identity.",
  };

  const verficationFormStructure: FormStructure = {
    title: "Verify Your Identity",
    fieldsets: [
      {
        rows: [
          {
            id: 1,
            fields: [otpField],
          },
        ],
      },
    ],
  };

  return {
    verifyFormStructure,
    updateFormStructure,
    verficationFormStructure,
  };
};
