import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { ServerErrorResponse } from "@/types";
import { requestSignInDtoSchema } from "@/types/validations/auth.validation";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import DividedText from "../shared/DividedText";
import { StableKeyboardAwareScrollView } from "../shared/StableKeyboardAwareScrollView";
import { FormBuilder } from "../shared/form-builder/FormBuilder";
import { useSignInFormStructure } from "./useSigninFormStructure";
import { SSOButtons } from "./SSOButtons";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { ApplicationHeader } from "../shared/AppHeader";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";
import { AppHeaderBack } from "@/components/shared/AppHeaderBack";

interface SigninProps {
  className?: string;
}

export const SigninLayout = ({ className }: SigninProps) => {
  const { t } = useTranslation("auth");
  const authStore = useAuthStore();

  const { mutate: SignIn, isPending: isSignInPending } = useMutation({
    mutationFn: async () => api.auth.signIn(authStore.signInRequest),
    onSuccess: () => {
      router.replace("/");
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message || t("auth.signIn.toasts.error"),
        {},
      );
    },
  });

  const { signInFormStructure } = useSignInFormStructure({
    store: authStore,
    isPending: isSignInPending,
  });

  React.useEffect(() => {
    return () => {
      authStore.reset();
    };
  }, []);

  const onSignInPress = () => {
    authStore.resetErrors();
    const result = requestSignInDtoSchema.safeParse(authStore.signInRequest);
    if (!result.success) {
      authStore.set("signInRequestErrors", result.error.flatten().fieldErrors);
    } else SignIn();
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        titleVariant="large"
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <View className="flex-1 bg-background">
        <StableKeyboardAwareScrollView className="flex-1 bg-background">
          <View
            className={cn(
              "flex flex-col flex-1 justify-centers gap-5 p-4 bg-background",
              className,
            )}
          >
            <View className="my-5">
              <Text className="text-2xl font-extrabold text-center">
                {t("auth.signIn.title")}
              </Text>
              <Text className="text-2xl font-thin text-center">
                {t("auth.signIn.subtitle")}
              </Text>
            </View>

            <View className="flex flex-col gap-2 w-fit">
              <FormBuilder structure={signInFormStructure} />

              <Text className="text-base font-bold ml-auto my-1">
                {t("auth.signIn.forgotPassword")}
              </Text>

              <Button
                disabled={isSignInPending}
                variant="default"
                size="lg"
                className="relative flex flex-row items-center justify-center rounded-xl h-14"
                onPress={onSignInPress}
              >
                <Text className="text-lg font-bold text-white">
                  {t("auth.signIn.actions.continueWithEmail")}
                </Text>
              </Button>

              <DividedText text={t("auth.or")} />

              <SSOButtons isSignInPending={isSignInPending} />
            </View>

            <View className="flex flex-row gap-1 items-center justify-center mb-10">
              <Text className="text-base">{t("auth.signIn.noAccount")}</Text>
              <Text
                className="text-base font-bold"
                onPress={() => router.push("/auth/sign-up")}
              >
                {t("auth.signIn.createAccount")}
              </Text>
            </View>
          </View>
        </StableKeyboardAwareScrollView>
      </View>
    </StableSafeAreaView>
  );
};
