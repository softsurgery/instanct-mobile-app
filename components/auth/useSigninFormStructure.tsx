import { AuthStore } from "@/stores/useAuthStore";
import { useTranslation } from "react-i18next";
import {
  EmailFieldProps,
  Field,
  FieldVariant,
  FormStructure,
} from "../shared/form-builder/types";

interface useSignInFormStructureProps {
  store: AuthStore;
  isPending?: boolean;
}

export const useSignInFormStructure = ({
  store,
  isPending,
}: useSignInFormStructureProps) => {
  const { t } = useTranslation("auth");

  //email
  const emailField: Field<EmailFieldProps> = {
    id: "email",
    label: t("auth.signIn.labels.email"),
    description: t("auth.signIn.descriptions.email"),
    placeholder: t("auth.signIn.placeholders.email"),
    variant: FieldVariant.EMAIL,
    className: "w-full",
    error: t(store.signInRequestErrors.email?.[0]),
    props: {
      value: store.signInRequest.email,
      onChangeText: (value: string) => {
        store.setNested("signInRequest.email", value);
        store.setNested("signInRequestErrors.email", []);
      },
      editable: !isPending,
    },
  };

  //password
  const passwordField: Field = {
    id: "password",
    label: t("auth.signIn.labels.password"),
    description: t("auth.signIn.descriptions.password"),
    variant: FieldVariant.PASSWORD,
    error: t(store.signInRequestErrors.password?.[0]),
    props: {
      value: store.signInRequest.password,
      onChangeText: (text: string) => {
        store.setNested("signInRequest.password", text);
        store.setNested("signInRequestErrors.password", []);
      },
      editable: !isPending,
    },
  };

  const signInFormStructure: FormStructure = {
    title: "",
    description: "",
    orientation: "vertical",
    fieldsets: [
      {
        title: "",
        rows: [
          {
            id: 1,
            fields: [emailField, passwordField],
          },
        ],
      },
    ],
  };

  return {
    signInFormStructure,
  };
};
