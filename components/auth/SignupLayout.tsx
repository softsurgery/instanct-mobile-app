import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { router } from "expo-router";
import { View } from "react-native";
import DividedText from "../shared/DividedText";
import { StableKeyboardAwareScrollView } from "../shared/StableKeyboardAwareScrollView";
import { FormBuilder } from "../shared/form-builder/FormBuilder";
import { useSignUpFormStructure } from "./useSignupFormStructure";
import { SSOButtons } from "./SSOButtons";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";

interface SignupProps {
  className?: string;
}

export const SignupLayout = ({ className }: SignupProps) => {
  const authStore = useAuthStore();
  const { signUpFormStructure } = useSignUpFormStructure({ store: authStore });

  return (
    <StableSafeAreaView className="flex-1">
      <StableKeyboardAwareScrollView>
        <View
          className={cn("flex flex-col justify-center gap-5 p-4 pb-6", className)}
        >
          <View className="my-5">
            <Text className="text-2xl font-extrabold text-center">
              Create Account
            </Text>
            <Text className="text-2xl font-thin text-center">
              Join us and get started!
            </Text>
          </View>

          <View className="flex flex-col gap-2 px-2 w-fit">
            <FormBuilder structure={signUpFormStructure} />

            <Button
              disabled={false}
              className="flex flex-row justify-center gap-2 my-1"
              onPress={() => {}}
            >
              <Text className="font-bold">Create My Account</Text>
            </Button>

            <DividedText text="OR" />

            <SSOButtons isSignInPending={false} />
          </View>

          <View className="flex flex-row gap-1 items-center justify-center">
            <Text variant={"muted"}>Already have an account?</Text>
            <Text
              variant={"small"}
              onPress={() => {
                router.push("/auth/sign-in");
              }}
            >
              Sign in
            </Text>
          </View>
        </View>
      </StableKeyboardAwareScrollView>
    </StableSafeAreaView>
  );
};
