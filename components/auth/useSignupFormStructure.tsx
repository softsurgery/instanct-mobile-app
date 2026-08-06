import { AuthStore } from "@/stores/useAuthStore";
import {
  Field,
  FieldVariant,
  FormStructure,
  MultiSelectFieldProps,
  PictureFieldProps,
  SelectOption,
  TextFieldProps,
} from "../shared/form-builder/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

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
  industriesOptions: SelectOption[];
  uploadPicture: (options: {
    files: File[];
    onProgress: (progress: number) => void;
  }) => void;
  isProfilePictureUploadPending: boolean;
}

export const useSignUpFormStructure = ({
  store,
  isPending,
  usernameValidation: { usernameError, isUsernameTaken, isCheckingUsername },
  emailValidation: { emailError, isEmailTaken, isCheckingEmail },
  industriesOptions,
  uploadPicture,
  isProfilePictureUploadPending,
}: useSignUpFormStructureProps) => {
  const { t } = useTranslation("auth");

  // firstName
  const firstnameField: Field = {
    id: "firstName",
    label: t("auth.signUp.labels.firstName"),
    description: t("auth.signUp.descriptions.firstName"),
    placeholder: t("auth.signUp.placeholders.firstName"),
    variant: FieldVariant.TEXT,
    className:
      store.signUpRequest.firstName && !store.signUpRequestErrors.firstName?.[0]
        ? "border border-green-500"
        : "",
    error: t(store.signUpRequestErrors?.firstName?.[0]),
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
    label: t("auth.signUp.labels.lastName"),
    description: t("auth.signUp.descriptions.lastName"),
    placeholder: t("auth.signUp.placeholders.lastName"),
    variant: FieldVariant.TEXT,
    className:
      store.signUpRequest.lastName && !store.signUpRequestErrors.lastName?.[0]
        ? "border border-green-500"
        : "",
    error: t(store.signUpRequestErrors?.lastName?.[0]),
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
    ? t("auth.signUp.descriptions.email.default")
    : isCheckingEmail
      ? t("auth.signUp.descriptions.email.checking")
      : isEmailTaken
        ? t("auth.signUp.descriptions.email.taken")
        : t("auth.signUp.descriptions.email.available");

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
      ? t(emailError!) ||
        (isEmailTaken ? t("auth.signUp.errors.emailTaken") : "")
      : "";

  const emailField: Field = {
    id: "email",
    label: t("auth.signUp.labels.email"),
    description: emailFieldDescription,
    placeholder: t("auth.signUp.placeholders.email"),
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
    ? t("auth.signUp.descriptions.username.default")
    : isCheckingUsername
      ? t("auth.signUp.descriptions.username.checking")
      : isUsernameTaken
        ? t("auth.signUp.descriptions.username.taken")
        : t("auth.signUp.descriptions.username.available");

  const usernameFieldClassName = cn(
    "w-full",
    !isCheckingUsername && !isUsernameTaken && store.signUpRequest.username
      ? "border border-green-500"
      : "",
    !isCheckingUsername && isUsernameTaken ? "border border-red-500" : "",
  );

  const usernameFieldError =
    store.signUpRequest.username.length > 0
      ? t(usernameError!) ||
        (isUsernameTaken ? t("auth.signUp.errors.usernameTaken") : "")
      : "";

  const usernameField: Field<TextFieldProps> = {
    id: "username",
    label: t("auth.signUp.labels.username"),
    description: usernameFieldDescription,
    placeholder: t("auth.signUp.placeholders.username"),
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
    label: t("auth.signUp.labels.password"),
    description: t("auth.signUp.descriptions.password"),
    placeholder: t("auth.signUp.placeholders.password"),
    variant: FieldVariant.PASSWORD,
    className:
      store.signUpRequest.password && !store.signUpRequestErrors.password?.[0]
        ? "border border-green-500"
        : "",
    error: t(store.signUpRequestErrors?.password?.[0]),
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
    label: t("auth.signUp.labels.confirmPassword"),
    description: t("auth.signUp.descriptions.confirmPassword"),
    placeholder: t("auth.signUp.placeholders.confirmPassword"),
    variant: FieldVariant.PASSWORD,
    className:
      store.utilities.confirmPassword &&
      !store.signUpRequestErrors.confirmPassword?.[0]
        ? "border border-green-500"
        : "",
    error: t(store.signUpRequestErrors?.confirmPassword?.[0]),
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

  const industriesFormStructure: FormStructure = {
    title: t("auth.signUp.steps.industries.title"),
    fieldsets: [
      {
        rows: [
          {
            id: 1,
            fields: [
              {
                id: "industries",
                variant: FieldVariant.MULTISELECT,
                label: "",
                description: t("auth.signUp.descriptions.industries"),
                props: {
                  value: store.signUpRequest.industries.map(String),
                  onSelect: (ids) =>
                    store.setNested(
                      "signUpRequest.industries",
                      ids.map(Number),
                    ),
                  options: industriesOptions,
                  max: 5,
                } satisfies MultiSelectFieldProps,
              },
            ],
          },
        ],
      },
    ],
  };

  const pictureField: Field<PictureFieldProps> = {
    id: "picture",
    label: t("auth.signUp.labels.picture"),
    variant: FieldVariant.PICTURE,
    description: t("auth.signUp.descriptions.picture"),
    className: "h-40 w-40 rounded-full mt-2",
    wrapperClassName: "flex flex-row items-center justify-center",
    fieldClassName: "flex flex-col items-center justify-center",
    props: {
      image: store?.utilities.picture,
      alt: "?",
      editable: !isProfilePictureUploadPending && !isPending,
      onFileChange: (value) => {
        store.setNested("utilities.picture", value);
      },
      onUpload: (file, onProgress) => {
        store.setNested("utilities.progress", 0);
        uploadPicture({
          files: [file],
          onProgress: (progress: number) => {
            store.setNested("utilities.progress", progress);
            onProgress(progress);
          },
        });
      },
    },
  };

  const profilePictureFieldset: FormStructure = {
    title: t("auth.signUp.steps.picture.title"),
    description: t("auth.signUp.descriptions.picture"),
    fieldsets: [
      {
        title: "",
        rows: [
          {
            id: 1,
            fields: [pictureField],
          },
        ],
      },
    ],
  };

  return {
    signUpFormStructure,
    industriesFormStructure,
    profilePictureFieldset,
  };
};
