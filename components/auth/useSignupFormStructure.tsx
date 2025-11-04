import { AuthStore } from "@/stores/useAuthStore";
import {
  Field,
  FieldVariant,
  FormStructure,
} from "../shared/form-builder/types";

interface useSignUpFormStructureProps {
  store: AuthStore;
  isPending?: boolean;
}

export const useSignUpFormStructure = ({
  store,
  isPending,
}: useSignUpFormStructureProps) => {
  // firstName
  const firstnameField: Field = {
    id: "firstName",
    label: "First Name",
    description: "Your first name (e.g., John).",
    placeholder: "John",
    variant: FieldVariant.TEXT,
    className: "w-full",
    error: store.signUpRequestErrors?.firstName?.[0],
    props: {
      value: store.signUpRequest.firstName,
      onChangeText: (text: string) => {
        store.setNested("signUpRequest.firstName", text);
        store.setNested("signUpRequestErrors.firstName", []);
      },
      editable: !isPending,
    },
  };

  // lastName
  const lastnameField: Field = {
    id: "lastName",
    label: "Last Name",
    description: "Your last name (e.g., Doe).",
    placeholder: "Doe",
    variant: FieldVariant.TEXT,
    className: "w-full",
    error: store.signUpRequestErrors?.lastName?.[0],
    props: {
      value: store.signUpRequest.lastName,
      onChangeText: (text: string) => {
        store.setNested("signUpRequest.lastName", text);
        store.setNested("signUpRequestErrors.lastName", []);
      },
      editable: !isPending,
    },
  };

  // email
  const emailField: Field = {
    id: "email",
    label: "E-mail",
    description: "Enter your e-mail",
    placeholder: "john@doe.com",
    variant: FieldVariant.EMAIL,
    className: "w-full",
    error: store.signUpRequestErrors?.email?.[0],
    props: {
      value: store.signUpRequest.email,
      onChangeText: (text: string) => {
        store.setNested("signUpRequest.email", text);
        store.setNested("signUpRequestErrors.email", []);
      },
      editable: !isPending,
    },
  };

  // username
  const usernameField: Field = {
    id: "username",
    label: "Username",
    description: "Your username (e.g., johndoe)",
    placeholder: "johndoe",
    variant: FieldVariant.TEXT,
    className: "w-full",
    error: store.signUpRequestErrors?.username?.[0],
    props: {
      value: store.signUpRequest.username,
      onChangeText: (text: string) => {
        store.setNested("signUpRequest.username", text);
        store.setNested("signUpRequestErrors.username", []);
      },
      editable: !isPending,
    },
  };

  // password
  const passwordField: Field = {
    id: "password",
    label: "Password",
    description: "Enter your password",
    placeholder: "••••••••",
    variant: FieldVariant.PASSWORD,
    className: "w-full",
    error: store.signUpRequestErrors?.password?.[0],
    props: {
      value: store.signUpRequest.password,
      onChangeText: (text: string) => {
        store.setNested("signUpRequest.password", text);
        store.setNested("signUpRequestErrors.password", []);
      },
      editable: !isPending,
    },
  };

  // confirmPassword
  const confirmPasswordField: Field = {
    id: "confirmPassword",
    label: "Confirm Password",
    description: "Re-enter your password",
    placeholder: "••••••••",
    variant: FieldVariant.PASSWORD,
    className: "w-full",
    error: store.signUpRequestErrors?.confirmPassword?.[0],
    props: {
      value: store.utilities.confirmPassword,
      onChangeText: (text: string) => {
        store.setNested("utilities.confirmPassword", text);
        store.setNested("signUpRequestErrors.confirmPassword", []);
      },
      editable: !isPending,
    },
  };

  // FormStructure vertical simple (ancien FormBuilder)
  const signUpFormStructure: FormStructure = {
    title: "",
    description: "",
    orientation: "vertical",
    fieldsets: [
      {
        title: "",
        rows: [
          {
            id: 1,
            fields: [
              firstnameField,
              lastnameField,
              emailField,
              usernameField,
              passwordField,
              confirmPasswordField,
            ],
          },
        ],
      },
    ],
  };

  return {
    signUpFormStructure,
  };
};
