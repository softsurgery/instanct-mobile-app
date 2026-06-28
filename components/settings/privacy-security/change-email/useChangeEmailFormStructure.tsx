import { UserStore } from "@/stores/useUserStore";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("settings");

  const currentEmailField: Field<EmailFieldProps> = {
    id: "currentEmail",
    label: t(
      "settings.account.screens.privacy-security.screens.account-security.change-email.forms.current-email",
    ),
    variant: FieldVariant.EMAIL,
    required: true,
    placeholder: t(
      "settings.account.screens.privacy-security.screens.account-security.change-email.forms.placeholders.current-email",
    ),
    description: t(
      "settings.account.screens.privacy-security.screens.account-security.change-email.forms.descriptions.current-email",
    ),
    props: {
      editable: false,
      value: store.response?.email,
    },
  };

  const newEmailField: Field<EmailFieldProps> = {
    id: "newEmail",
    label: t(
      "settings.account.screens.privacy-security.screens.account-security.change-email.forms.new-email",
    ),
    variant: FieldVariant.EMAIL,
    required: true,
    placeholder: t(
      "settings.account.screens.privacy-security.screens.account-security.change-email.forms.placeholders.new-email",
    ),
    description: t(
      "settings.account.screens.privacy-security.screens.account-security.change-email.forms.descriptions.new-email",
    ),
    props: {
      value: store.updateDto.email,
      onChangeText: (text) => store.setNested("updateDto.email", text),
    },
  };

  const passwordField: Field<PasswordFieldProps> = {
    id: "currentPassword",
    label: t(
      "settings.account.screens.privacy-security.screens.account-security.change-email.forms.current-password",
    ),
    variant: FieldVariant.PASSWORD,
    required: true,
    placeholder: t(
      "settings.account.screens.privacy-security.screens.account-security.change-email.forms.placeholders.current-password",
    ),
    description: t(
      "settings.account.screens.privacy-security.screens.account-security.change-email.forms.descriptions.current-password",
    ),
    props: {
      value: store.updateDto.password,
      onChangeText: (text) => store.setNested("updateDto.password", text),
    },
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
