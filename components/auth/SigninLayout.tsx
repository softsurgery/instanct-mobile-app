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
import { Image, View } from "react-native";
import { showToastable } from "react-native-toastable";
import DividedText from "../shared/DividedText";
import { StableKeyboardAwareScrollView } from "../shared/StableKeyboardAwareScrollView";
import { FormBuilder } from "../shared/form-builder/FormBuilder";
import { useSignInFormStructure } from "./useSigninFormStructure";

interface SigninProps {
  className?: string;
}

export const SigninLayout = ({ className }: SigninProps) => {
  const authStore = useAuthStore();

  const { mutate: SignIn, isPending: isSignInPending } = useMutation({
    mutationFn: async () => api.auth.signIn(authStore.signInRequest),
    onSuccess: () => {
      router.replace("/");
    },
    onError: (error: ServerErrorResponse) => {
      showToastable({
        message: error.response?.data.message,
        status: "danger",
      });
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
    <StableKeyboardAwareScrollView>
      <View
        className={cn("flex flex-col justify-centers gap-5 p-4", className)}
      >
        <View className="my-5">
          <Text className="text-2xl font-extrabold text-center">
            Welecome Back
          </Text>
          <Text className="text-2xl font-thin text-center">
            Glad to see you again
          </Text>
        </View>

        <View className="flex flex-col gap-2 px-2 w-fit">
          <FormBuilder structure={signInFormStructure} />

          <Text className="text-md font-bold ml-auto my-1">
            Forget Password ?
          </Text>

          <Button
            disabled={isSignInPending}
            className="flex flex-row justify-center gap-2 my-1"
            onPress={onSignInPress}
          >
            <Text className="font-bold">Continue with E-Mail</Text>
          </Button>

          <DividedText text="OR" />

          <View className="flex flex-col justify-center gap-2 my-1">
            <Button
              size={"lg"}
              disabled={isSignInPending}
              className="flex flex-row w-fit gap-2 bg-red-600"
            >
              <Image
                className="w-6 h-6 shadow-md"
                source={require("@/assets/images/google.png")}
              />
              <Text className="text-lg font-bold text-white">
                Continue with Google
              </Text>
            </Button>

            <Button
              size={"lg"}
              disabled={isSignInPending}
              className="flex flex-row w-fit gap-2 bg-blue-600"
            >
              <Image
                className="w-6 h-6 shadow-md"
                source={require("@/assets/images/facebook.png")}
              />
              <Text className="text-lg font-bold text-white">
                Continue with Facebook
              </Text>
            </Button>
          </View>
        </View>

        <View className="flex flex-row gap-1 items-center justify-center">
          <Text variant={"muted"}>Don&apos;t have an account?</Text>
          <Text
            variant={"small"}
            onPress={() => {
              router.push("/auth/sign-up");
            }}
          >
            Create an account
          </Text>
        </View>
      </View>
    </StableKeyboardAwareScrollView>
  );
};
