import { Image, Platform, View } from "react-native";
import { Button } from "../ui/button";
import { useColorScheme } from "nativewind";
import { Text } from "../ui/text";
import { cn } from "~/lib/utils";
import { Icon } from "../ui/icon";
import { Mail } from "lucide-react-native";
import { Separator } from "../ui/separator";
import { router } from "expo-router";
import DividedText from "../shared/DividedText";

export interface SSOButtonsProps {
  className?: string;
  classic?: boolean;
  isSignInPending: boolean;
}

export const SSOButtons = ({
  className,
  classic = false,
  isSignInPending,
}: SSOButtonsProps) => {
  const { colorScheme } = useColorScheme();
  const textWidth = "w-[9.5rem]";
  return (
    <View className={cn("flex flex-col justify-center gap-2", className)}>
      {Platform.OS === "ios" && (
        <Button
          disabled={isSignInPending}
          variant={"outline"}
          size={"sm"}
          className="flex flex-row w-fit gap-2"
        >
          <Image
            className="w-6 h-6 shadow-md"
            source={
              colorScheme === "dark"
                ? require("~/assets/images/apple-dark.png")
                : require("~/assets/images/apple.png")
            }
          />
          <Text className={cn("text-sm font-bold text-foreground", textWidth)}>
            Continue with Apple
          </Text>
        </Button>
      )}
      <Button
        disabled={isSignInPending}
        className="flex flex-row w-fit gap-2 bg-red-600"
        size={"sm"}
      >
        <Image
          className="w-6 h-6 shadow-md"
          source={require("~/assets/images/google.png")}
        />
        <Text className={cn("text-sm font-bold text-foreground", textWidth)}>
          Continue with Google
        </Text>
      </Button>
      <Button
        disabled={isSignInPending}
        variant={"secondary"}
        className="flex flex-row w-fit gap-2"
        size={"sm"}
      >
        <Image
          className="w-6 h-6 shadow-md"
          source={require("~/assets/images/linkedIn.png")}
        />
        <Text className={cn("text-sm font-bold text-foreground", textWidth)}>
          Continue with Linkedin
        </Text>
      </Button>
      {classic && (
        <>
          <DividedText text="OR" />
          <Button
            className="flex flex-row w-fit gap-2"
            size={"sm"}
            disabled={isSignInPending}
            onPress={() => router.push("/auth/sign-in")}
          >
            <Icon as={Mail} className="w-6 h-6 shadow-md" size={24} />
            <Text
              className={cn("text-sm font-bold text-foreground", textWidth)}
            >
              Continue with E-mail
            </Text>
          </Button>
        </>
      )}
    </View>
  );
};
