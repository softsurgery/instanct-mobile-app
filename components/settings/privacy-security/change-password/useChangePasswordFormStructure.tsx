import { UserStore } from "@/stores/useUserStore";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("settings");

  const currentPasswordField: Field<PasswordFieldProps> = {
    id: "currentPassword",
    label: t(
      "settings.account.screens.privacy-security.screens.account-security.change-password.forms.current-password"
    ),
    variant: FieldVariant.PASSWORD,
    required: true,
    placeholder: t(
      "settings.account.screens.privacy-security.screens.account-security.change-password.forms.placeholders.current-password"
    ),
    description: t(
      "settings.account.screens.privacy-security.screens.account-security.change-password.forms.descriptions.current-password"
    ),
    props: {
      value: store.updatePasswordDto.currentPassword,
      onChangeText: (text) =>
        store.setNested("updatePasswordDto.currentPassword", text),
    },
  };

  const newPasswordField: Field<PasswordFieldProps> = {
    id: "newPassword",
    label: t(
      "settings.account.screens.privacy-security.screens.account-security.change-password.forms.new-password"
    ),
    variant: FieldVariant.PASSWORD,
    required: true,
    placeholder: t(
      "settings.account.screens.privacy-security.screens.account-security.change-password.forms.placeholders.new-password"
    ),
    description: t(
      "settings.account.screens.privacy-security.screens.account-security.change-password.forms.descriptions.new-password"
    ),
    props: {
      value: store.updatePasswordDto.newPassword,
      onChangeText: (text) =>
        store.setNested("updatePasswordDto.newPassword", text),
    },
  };

  const confirmPasswordField: Field<PasswordFieldProps> = {
    id: "confirmPassword",
    label: t(
      "settings.account.screens.privacy-security.screens.account-security.change-password.forms.confirm-new-password"
    ),
    variant: FieldVariant.PASSWORD,
    required: true,
    placeholder: t(
      "settings.account.screens.privacy-security.screens.account-security.change-password.forms.placeholders.confirm-new-password"
    ),
    description: t(
      "settings.account.screens.privacy-security.screens.account-security.change-password.forms.descriptions.confirm-new-password"
    ),
    props: {
      value: store.updatePasswordDto.confirmPassword,
      onChangeText: (text) =>
        store.setNested("updatePasswordDto.confirmPassword", text),
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
