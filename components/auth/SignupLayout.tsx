import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { router } from "expo-router";
import { View } from "react-native";
import { FormBuilder } from "../shared/form-builder/FormBuilder";
import { useSignUpFormStructure } from "./useSignupFormStructure";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { ApplicationHeader } from "../shared/AppHeader";
import { ArrowLeft } from "lucide-react-native";
import { Stepper } from "../shared/Stepper";
import React from "react";
import { useAuthValidation } from "@/hooks/useAuthValidation";

interface SignupLayoutProps {
  className?: string;
}

export const SignupLayout = ({ className }: SignupLayoutProps) => {
  const authStore = useAuthStore();
  const { usernameValidation, emailValidation } = useAuthValidation();

  const { signUpFormStructure } = useSignUpFormStructure({
    store: authStore,
    usernameValidation,
    emailValidation,
  });

  React.useEffect(() => {
    return () => {
      authStore.reset();
    };
  }, []);

  const step1Validation =
    !usernameValidation.isCheckingUsername &&
    !emailValidation.isCheckingEmail &&
    !usernameValidation.isUsernameTaken &&
    !emailValidation.isEmailTaken &&
    !!authStore.signUpRequest.username &&
    !!authStore.signUpRequest.email &&
    !!authStore.signUpRequest.firstName &&
    !!authStore.signUpRequest.lastName &&
    !!authStore.signUpRequest.password &&
    authStore.signUpRequest.password.length >= 8 &&
    authStore.signUpRequest.password === authStore.utilities.confirmPassword;

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        titleVariant="large"
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => {
              router.back();
            },
          },
        ]}
      />
      <View className="flex-1 bg-background">
        <View className={cn("flex-1 px-2 bg-background", className)}>
          <Stepper
            classNames={{
              controlsWrapper: "pb-8",
            }}
            steps={[
              {
                title: "Introduce Yourself",
                description:
                  "Start by providing the basic details about yourself.",
                component: <FormBuilder structure={signUpFormStructure} />,
                validation: step1Validation,
              },
              {
                title: "Industries",
                description:
                  "Select the industries and objectives relevant to you.",
                component: null,
                validation: true,
              },
              {
                title: "Show us your face",
                description:
                  "Upload a profile picture to personalize your account.",
                component: true,
                validation: true,
              },
            ]}
            closingAction={{
              label: "Create My Account",
              onPress: () => {},
            }}
          />
        </View>
      </View>
    </StableSafeAreaView>
  );
};
