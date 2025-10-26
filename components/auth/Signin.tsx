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
import { useSignInFormStructure } from "./useSigninFormStructure";

interface SigninProps {
  className?: string;
}

export const Signin = ({ className }: SigninProps) => {
  const navigation = useNavigation<any>();
  const authStore = useAuthStore();
  const { signInFormStructure } = useSignInFormStructure({ store: authStore });
  return (
    <StableKeyboardAwareScrollView>
      <View className={cn("flex flex-col justify-center gap-5 p-4", className)}>
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
            disabled={false}
            className="flex flex-row justify-center gap-2 my-1"
            onPress={() => {}}
          >
            <Text className="font-bold">Continue with E-mail</Text>
            <Icon as={ArrowRight} size={24} className="text-white" />
          </Button>

          <DividedText text="OR" />

          <View className="flex flex-col justify-center gap-2 my-1">
            <Button
              disabled={false}
              className="flex flex-row w-fit gap-2 bg-red-600"
            >
              <Image
                className="w-6 h-6 shadow-md"
                source={require("~/assets/images/google.png")}
              />
              <Text className="text-lg font-bold text-white">
                Continue with Google
              </Text>
            </Button>

            <Button
              disabled={false}
              className="flex flex-row w-fit gap-2 bg-blue-600"
            >
              <Image
                className="w-6 h-6 shadow-md"
                source={require("~/assets/images/facebook.png")}
              />
              <Text className="text-lg font-bold text-white">
                Continue with Facebook
              </Text>
            </Button>
          </View>
        </View>

        <View className="flex flex-row gap-1 items-center justify-center my-auto">
          <Text className="text-lg">Don&apos;t have an account?</Text>
          <Text
            className="font-bold text-lg"
            onPress={() => navigation.navigate("auth/sign-up", { reset: true })}
          >
            Create an account
          </Text>
        </View>
      </View>
    </StableKeyboardAwareScrollView>
  );
};
