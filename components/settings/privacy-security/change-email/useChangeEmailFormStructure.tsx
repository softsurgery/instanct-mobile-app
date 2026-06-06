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

  const newEmailField: Field<EmailFieldProps> = {
    id: "newEmail",
    label: "New Email",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Enter your new Email",
    description:
      "Choose a stronger Email that is different from the one you already use.",
  };

  const passwordField: Field<PasswordFieldProps> = {
    id: "currentPassword",
    label: "Current Password",
    variant: FieldVariant.PASSWORD,
    required: true,
    placeholder: "Enter your current password",
    description: "Use the password associated with your account.",
  };

  const updateMailFormStructure: FormStructure = {
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
            fields: [newEmailField],
          },
          {
            id: 3,
            fields: [passwordField],
          },
        ],
      },
    ],
  };

  return {
    updateMailFormStructure,
  };
};
