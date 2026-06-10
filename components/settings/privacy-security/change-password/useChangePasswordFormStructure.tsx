import { UserStore } from "@/stores/useUserStore";
import {
  Field,
  FieldVariant,
  FormStructure,
  PasswordFieldProps,
} from "~/components/shared/form-builder/types";

interface UseChangePasswordFormStructureProps {
  store: UserStore;
}

export const useChangePasswordFormStructure = ({
  store,
}: UseChangePasswordFormStructureProps) => {
  const currentPasswordField: Field<PasswordFieldProps> = {
    id: "currentPassword",
    label: "Current Password",
    variant: FieldVariant.PASSWORD,
    required: true,
    placeholder: "Enter your current password",
    description: "Use the password associated with your account.",
    props: {
      value: store.updatePasswordDto.currentPassword,
      onChangeText: (text) => store.setNested("updatePasswordDto.currentPassword", text),
    },
  };

  const newPasswordField: Field<PasswordFieldProps> = {
    id: "newPassword",
    label: "New Password",
    variant: FieldVariant.PASSWORD,
    required: true,
    placeholder: "Enter your new password",
    description:
      "Choose a stronger password that is different from the one you already use.",
    props: {
      value: store.updatePasswordDto.newPassword,
      onChangeText: (text) => store.setNested("updatePasswordDto.newPassword", text),
    },
  };

  const confirmPasswordField: Field<PasswordFieldProps> = {
    id: "confirmPassword",
    label: "Confirm Password",
    variant: FieldVariant.PASSWORD,
    required: true,
    placeholder: "Re-enter your new password",
    description: "Repeat the new password to make sure it matches.",
    props: {
      value: store.updatePasswordDto.confirmPassword,
      onChangeText: (text) => store.setNested("updatePasswordDto.confirmPassword", text),
    },
  };

  const structure: FormStructure = {
    title: "Change Password",
    fieldsets: [
      {
        rows: [
          {
            id: 1,
            fields: [currentPasswordField],
          },
          {
            id: 2,
            fields: [newPasswordField],
          },
          {
            id: 3,
            fields: [confirmPasswordField],
          },
        ],
      },
    ],
  };

  return {
    structure,
  };
};
