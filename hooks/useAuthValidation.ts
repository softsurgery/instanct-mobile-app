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
  if (!value.trim()) return "First name is required";
  if (value.trim().length < 2)
    return "First name must contain at least 2 characters";

  if (!/^[a-zA-ZÀ-ÿ]+$/.test(value))
    return "First name must contain only letters";

  return null;
};

export const validateLastName = (value: string) => {
  if (!value.trim()) return "Last name is required";

  if (value.trim().length < 2)
    return "Last name must contain at least 2 characters";

  if (!/^[a-zA-ZÀ-ÿ]+$/.test(value))
    return "Last name must contain only letters";

  return null;
};

export const validateEmail = (value: string) => {
  if (!value.trim()) return "E-mail is required";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) return "Invalid e-mail address";

  return null;
};

export const validateUsername = (value: string) => {
  if (!value.trim()) return "Username is required";

  if (value.length < 3) return "Username must contain at least 3 characters";

  if (value.length > 20) return "Username cannot exceed 20 characters";

  if (!/^[a-zA-Z0-9._]+$/.test(value))
    return "Only letters, numbers, dots and underscores are allowed";

  return null;
};

export const validatePassword = (value: string) => {
  if (!value) return "Password is required";

  if (value.length < 8) return "Password must contain at least 8 characters";

  if (!/[A-Z]/.test(value)) return "Password must contain an uppercase letter";

  if (!/[a-z]/.test(value)) return "Password must contain a lowercase letter";

  if (!/[0-9]/.test(value)) return "Password must contain a number";

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
    return "Password must contain a special character";

  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
) => {
  if (!confirmPassword) return "Please confirm your password";

  if (password !== confirmPassword) return "Passwords do not match";

  return null;
};
