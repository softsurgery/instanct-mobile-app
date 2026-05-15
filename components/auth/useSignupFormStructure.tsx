import { AuthStore } from "@/stores/useAuthStore";
import {
  Field,
  FieldVariant,
  FormStructure,
  TextFieldProps,
} from "../shared/form-builder/types";
import { cn } from "@/lib/utils";

interface useSignUpFormStructureProps {
  store: AuthStore;
  isPending?: boolean;
  usernameValidation: {
    usernameError: string | null;
    isUsernameTaken: boolean;
    isCheckingUsername: boolean;
  };
  emailValidation: {
    emailError: string | null;
    isEmailTaken: boolean;
    isCheckingEmail: boolean;
  };
}

export const useSignUpFormStructure = ({
  store,
  isPending,
  usernameValidation: { usernameError, isUsernameTaken, isCheckingUsername },
  emailValidation: { emailError, isEmailTaken, isCheckingEmail },
}: useSignUpFormStructureProps) => {
  // firstName
  const firstnameField: Field = {
    id: "firstName",
    label: "Firstname",
    description: "Tell us your first name.",
    placeholder: "Please enter your first name",
    variant: FieldVariant.TEXT,
    className:
      store.signUpRequest.firstName && !store.signUpRequestErrors.firstName?.[0]
        ? "border border-green-500"
        : "",
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
    label: "Lastname",
    description: "Tell us your last name.",
    placeholder: "Please enter your last name",
    variant: FieldVariant.TEXT,
    className:
      store.signUpRequest.lastName && !store.signUpRequestErrors.lastName?.[0]
        ? "border border-green-500"
        : "",
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
  const emailFieldDescription = !store.signUpRequest.email
    ? "This will be used for logging in and account recovery"
    : isCheckingEmail
      ? "Checking availability..."
      : isEmailTaken
        ? "E-mail already taken"
        : "This e-mail is available";

  const emailFieldClassName = cn(
    !emailError &&
      !isCheckingEmail &&
      !isEmailTaken &&
      store.signUpRequest.email
      ? "border border-green-500"
      : "",
    !isCheckingEmail && isEmailTaken ? "border border-red-500" : "",
  );

  const emailFieldError =
    store.signUpRequest.email.length > 0
      ? emailError || (isEmailTaken ? "E-mail is already taken" : "")
      : "";

  const emailField: Field = {
    id: "email",
    label: "E-mail",
    description: emailFieldDescription,
    placeholder: "Please enter your e-mail",
    variant: FieldVariant.EMAIL,
    className: emailFieldClassName,
    error: emailFieldError,
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
  const usernameFieldDescription = !store.signUpRequest.username
    ? "Choose a unique username for your profile"
    : isCheckingUsername
      ? "Checking availability..."
      : isUsernameTaken
        ? "Username already taken"
        : "This username is available";

  const usernameFieldClassName = cn(
    "w-full",
    !isCheckingUsername && !isUsernameTaken && store.signUpRequest.username
      ? "border border-green-500"
      : "",
    !isCheckingUsername && isUsernameTaken ? "border border-red-500" : "",
  );

  const usernameFieldError =
    store.signUpRequest.username.length > 0
      ? usernameError || (isUsernameTaken ? "Username is already taken" : "")
      : "";

  const usernameField: Field<TextFieldProps> = {
    id: "username",
    label: "Username",
    description: usernameFieldDescription,
    placeholder: "Please enter your username",
    variant: FieldVariant.TEXT,
    className: usernameFieldClassName,
    error: usernameFieldError,
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
    placeholder: "Please enter your password (8+ characters)",
    variant: FieldVariant.PASSWORD,
    className:
      store.signUpRequest.password && !store.signUpRequestErrors.password?.[0]
        ? "border border-green-500"
        : "",
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
    placeholder: "Please confirm your password",
    variant: FieldVariant.PASSWORD,
    className:
      store.utilities.confirmPassword && !store.signUpRequestErrors.confirmPassword?.[0]
        ? "border border-green-500"
        : "",
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
