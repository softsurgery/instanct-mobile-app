import { useAuthStore } from "@/stores/useAuthStore";
import { useDebounce } from "./useDebounce";
import { useIdentifiedUserUsername } from "./content/users/useIdentifiedUserUsername";
import { useIdentifiedUserEmail } from "./content/users/useIdentifiedUserEmail";
import React from "react";

interface useAuthValidationProps {}

export const useAuthValidation = ({}: useAuthValidationProps = {}) => {
  const authStore = useAuthStore();

  const { value: debouncedFirstName } = useDebounce(
    authStore.signUpRequest.firstName,
    0,
  );

  const { value: debouncedLastName } = useDebounce(
    authStore.signUpRequest.lastName,
    0,
  );

  const { value: debouncedUsername } = useDebounce(
    authStore.signUpRequest.username,
    1000,
  );

  const { value: debouncedEmail } = useDebounce(
    authStore.signUpRequest.email,
    1000,
  );

  const { value: debouncedPassword } = useDebounce(
    authStore.signUpRequest.password,
    0,
  );

  const { value: debouncedConfirmPassword } = useDebounce(
    authStore.utilities.confirmPassword,
    0,
  );

  React.useEffect(() => {
    if (!debouncedFirstName) return;
    const error = validateFirstName(debouncedFirstName);
    authStore.setNested("signUpRequestErrors.firstName", error ? [error] : []);
  }, [debouncedFirstName]);

  React.useEffect(() => {
    if (!debouncedLastName) return;
    const error = validateLastName(debouncedLastName);
    authStore.setNested("signUpRequestErrors.lastName", error ? [error] : []);
  }, [debouncedLastName]);

  React.useEffect(() => {
    if (!debouncedPassword) return;
    const error = validatePassword(debouncedPassword);
    authStore.setNested("signUpRequestErrors.password", error ? [error] : []);
  }, [debouncedPassword]);

  React.useEffect(() => {
    if (!debouncedConfirmPassword) return;
    const error = validateConfirmPassword(
      debouncedPassword,
      debouncedConfirmPassword,
    );
    authStore.setNested(
      "signUpRequestErrors.confirmPassword",
      error ? [error] : [],
    );
  }, [debouncedConfirmPassword, debouncedPassword]);

  const usernameError = React.useMemo(
    () => validateUsername(debouncedUsername),
    [debouncedUsername],
  );

  const emailError = React.useMemo(
    () => validateEmail(debouncedEmail),
    [debouncedEmail],
  );

  const { user: usernameUser, isUserPending: isCheckingUsername } =
    useIdentifiedUserUsername({
      username: debouncedUsername,
      enabled: !!debouncedUsername && !usernameError,
    });

  const { user: emailUser, isUserPending: isCheckingEmail } =
    useIdentifiedUserEmail({
      email: debouncedEmail,
      enabled: !!debouncedEmail && !emailError,
    });

  return {
    usernameValidation: {
      usernameError,
      isUsernameTaken: !!usernameUser,
      isCheckingUsername,
    },
    emailValidation: {
      emailError,
      isEmailTaken: !!emailUser,
      isCheckingEmail,
    },
  };
};

export const validateFirstName = (value: string) => {
  if (!value.trim()) return `auth.validation.signUp.firstNameRequired`;

  if (value.trim().length < 2)
    return `auth.validation.signUp.firstNameTooShort`;

  // Allow letters and spaces
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value))
    return `auth.validation.signUp.firstNameFormat`;

  return null;
};

export const validateLastName = (value: string) => {
  if (!value.trim()) return `auth.validation.signUp.lastNameRequired`;

  if (value.trim().length < 2) return `auth.validation.signUp.lastNameTooShort`;

  // Allow letters and spaces
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value))
    return `auth.validation.signUp.lastNameFormat`;

  return null;
};

export const validateEmail = (value: string) => {
  if (!value.trim()) return `auth.validation.signUp.emailRequired`;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) return `auth.validation.signUp.emailInvalid`;

  return null;
};

export const validateUsername = (value: string) => {
  if (!value.trim()) return `auth.validation.signUp.usernameRequired`;

  if (value.length < 3) return `auth.validation.signUp.usernameTooShort`;

  if (value.length > 20) return `auth.validation.signUp.usernameTooLong`;

  if (!/^[a-zA-Z0-9._]+$/.test(value))
    return `auth.validation.signUp.usernameFormat`;

  return null;
};

export const validatePassword = (value: string) => {
  if (!value) return `auth.validation.signUp.passwordRequired`;

  if (value.length < 8) return `auth.validation.signUp.passwordTooShort`;

  if (!/[A-Z]/.test(value)) return `auth.validation.signUp.passwordUppercase`;

  if (!/[a-z]/.test(value)) return `auth.validation.signUp.passwordLowercase`;

  if (!/[0-9]/.test(value)) return `auth.validation.signUp.passwordNumber`;

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
    return `auth.validation.signUp.passwordSpecialChar`;

  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
) => {
  if (!confirmPassword) return `auth.validation.signUp.confirmPasswordRequired`;

  if (password !== confirmPassword)
    return `auth.validation.signUp.passwordsMismatch`;

  return null;
};
