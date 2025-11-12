import { AuthStore } from "@/stores/useAuthStore";
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
  //email
  const emailField: Field<EmailFieldProps> = {
    id: "email",
    label: "E-mail",
    description: "Please enter your e-mail",
    placeholder: "john@doe.com",
    variant: FieldVariant.EMAIL,
    className: "w-full",
    error: store.signInRequestErrors.email?.[0],
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
    label: "Password",
    description: "Please enter your password",
    variant: FieldVariant.PASSWORD,
    error: store.signInRequestErrors.password?.[0],
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
