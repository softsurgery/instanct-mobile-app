import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { Image } from "expo-image";
import { useNavigation } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { View } from "react-native";
import DividedText from "../shared/DividedText";
import { StableKeyboardAwareScrollView } from "../shared/StableKeyboardAwareScrollView";
import { FormBuilder } from "../shared/form-builder/FormBuilder";
import { Icon } from "../ui/icon";
import { useSignUpFormStructure } from "./useSignupFormStructure";

interface SignupProps {
  className?: string;
}

export const SignupLayout = ({ className }: SignupProps) => {
  const navigation = useNavigation<any>();
  const authStore = useAuthStore();
  const { signUpFormStructure } = useSignUpFormStructure({ store: authStore });

  return (
    <StableKeyboardAwareScrollView>
      <View className={cn("flex flex-col justify-center gap-5 p-4", className)}>
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
            <Text className="font-bold">Sign Up</Text>
            <Icon as={ArrowRight} size={24} className="text-white" />
          </Button>

          <DividedText text="OR" />

          <View className="flex flex-col justify-center gap-2 my-1">
            <Button
              disabled={false}
              className="flex flex-row w-fit gap-2 bg-red-600"
            >
              <Image className="w-6 h-6 shadow-md" />
              <Text className="text-lg font-bold text-white">
                Continue with Google
              </Text>
            </Button>

            <Button
              disabled={false}
              className="flex flex-row w-fit gap-2 bg-blue-600"
            >
              <Image className="w-6 h-6 shadow-md" />
              <Text className="text-lg font-bold text-white">
                Continue with Facebook
              </Text>
            </Button>
          </View>
        </View>

        <View className="flex flex-row gap-1 items-center justify-center my-auto">
          <Text className="text-lg">Already have an account?</Text>
          <Text
            className="font-bold text-lg"
            onPress={() => navigation.navigate("auth/sign-in", { reset: true })}
          >
            Sign in
          </Text>
        </View>
      </View>
    </StableKeyboardAwareScrollView>
  );
};
