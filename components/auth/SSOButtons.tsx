import { router } from "expo-router";
import { Mail } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Image, Platform, View } from "react-native";
import { cn } from "~/lib/utils";
import DividedText from "../shared/DividedText";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";

export interface SSOButtonsProps {
  className?: string;
  classic?: boolean;
  isSignInPending: boolean;
}

const IconSlot = ({ children }: { children: React.ReactNode }) => (
  <View className="w-10 items-center">{children}</View>
);

export const SSOButtons = ({
  className,
  classic = false,
  isSignInPending,
}: SSOButtonsProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <View className={cn("flex flex-col justify-center gap-2", className)}>
      {Platform.OS === "ios" && (
        <Button
          disabled={isSignInPending}
          variant="outline"
          size="sm"
          className="flex flex-row items-center gap-4"
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

          <Text className="text-sm font-bold text-foreground">
            Continue with Apple
          </Text>
        </Button>
      )}

      <Button
        disabled={isSignInPending}
        size="sm"
        className="flex flex-row items-center gap-4 bg-red-600"
      >
        <IconSlot>
          <Image
            className="w-6 h-6"
            source={require("~/assets/images/google.png")}
          />
        </IconSlot>

        <Text className="text-sm font-bold text-foreground">
          Continue with Google
        </Text>
      </Button>

      <Button
        disabled={isSignInPending}
        variant="secondary"
        size="sm"
        className="flex flex-row items-center gap-4"
      >
        <IconSlot>
          <Image
            className="w-6 h-6"
            source={require("~/assets/images/linkedIn.png")}
          />
        </IconSlot>

        <Text className="text-sm font-bold text-foreground">
          Continue with Linkedin
        </Text>
      </Button>

      {classic && (
        <>
          <DividedText text="OR" />

          <Button
            disabled={isSignInPending}
            size="sm"
            className="flex flex-row items-center gap-4"
            onPress={() => router.push("/auth/sign-in")}
          >
            <IconSlot>
              <Icon as={Mail} size={24} />
            </IconSlot>

            <Text className="text-sm font-bold text-foreground">
              Continue with E-mail
            </Text>
          </Button>
        </>
      )}
    </View>
  );
};
