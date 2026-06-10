import { useColorScheme } from "nativewind";
import { Image, Platform, View } from "react-native";
import { cn } from "~/lib/utils";
import DividedText from "../shared/DividedText";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { useSSO } from "@/hooks/useSSO";
import { router } from "expo-router";

export interface SSOButtonsProps {
  className?: string;
  classic?: boolean;
  isSignInPending?: boolean;
}

const IconSlot = ({ children }: { children: React.ReactNode }) => (
  <View className="absolute left-5 z-10 flex h-full justify-center items-center">
    {children}
  </View>
);

export const SSOButtons = ({
  className,
  classic = false,
  isSignInPending = false,
}: SSOButtonsProps) => {
  const { colorScheme } = useColorScheme();
  const {
    isPending: isSSOPending,
    signInWithGoogle,
    signInWithLinkedIn,
    signInWithApple,
    isGoogleReady,
    isLinkedInReady,
    isAppleReady,
  } = useSSO();

  const isDisabled = isSignInPending || isSSOPending;

  return (
    <View
      className={cn("flex flex-col justify-center gap-3.5 py-5", className)}
    >
      {Platform.OS === "ios" && (
        <Button
          disabled={isDisabled || !isAppleReady}
          variant="outline"
          size="lg"
          className="relative flex flex-row items-center justify-center rounded-xl h-14"
          onPress={signInWithApple}
        >
          <IconSlot>
            <Image
              className="w-6 h-6"
              source={
                colorScheme === "dark"
                  ? require("~/assets/images/apple-dark.png")
                  : require("~/assets/images/apple.png")
              }
            />
          </IconSlot>

          <Text className="text-lg font-bold text-foreground">
            Continue with Apple
          </Text>
        </Button>
      )}

      <Button
        disabled={isDisabled || !isGoogleReady}
        variant="outline"
        size="lg"
        className="relative flex flex-row items-center justify-center rounded-xl h-14"
        onPress={signInWithGoogle}
      >
        <IconSlot>
          <Image
            className="w-6 h-6"
            source={require("~/assets/images/google.png")}
          />
        </IconSlot>

        <Text className="text-lg font-bold text-foreground">
          Continue with Google
        </Text>
      </Button>

      <Button
        disabled={isDisabled || !isLinkedInReady}
        variant="outline"
        size="lg"
        className="relative flex flex-row items-center justify-center rounded-xl h-14"
        onPress={signInWithLinkedIn}
      >
        <IconSlot>
          <Image
            className="w-6 h-6"
            source={require("~/assets/images/linkedIn.png")}
          />
        </IconSlot>

        <Text className="text-lg font-bold text-foreground">
          Continue with LinkedIn
        </Text>
      </Button>

      {classic && (
        <>
          <DividedText text="OR" />

          <Button
            disabled={isDisabled}
            size="lg"
            className="relative flex flex-row items-center justify-center rounded-xl h-14"
            onPress={() => router.push("/auth/sign-in")}
          >
            <Text className="text-lg font-bold text-primary-foreground">
              Continue with Email
            </Text>
          </Button>
        </>
      )}
    </View>
  );
};
