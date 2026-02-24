import { cn } from "@/lib/utils";
import { View } from "react-native";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { ApplicationHeader } from "../shared/AppHeader";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { StableKeyboardAwareScrollView } from "../shared/StableKeyboardAwareScrollView";
import { FormBuilder } from "../shared/form-builder/FormBuilder";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { useSessionStarterFormStructure } from "./useSessionStarterFormStructure";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";

interface SessionStarterPortalProps {
  className?: string;
}

export const SessionStarterPortal = ({
  className,
}: SessionStarterPortalProps) => {
  const isKeyboardVisible = useKeyboardVisible();
  const { structure } = useSessionStarterFormStructure({});
  return (
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={"Start a Session"}
        titleVariant="large"
        reverse
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
        <StableKeyboardAwareScrollView className="flex-1 bg-background ">
          <View className="p-4">
            <Text className="text-sm text-muted-foreground leading-relaxed">
              Please provide the details about your session. This information
              will help others understand when you are available and interested
              in connecting.
            </Text>
          </View>
          <FormBuilder structure={structure} className="mt-4 px-2" />
        </StableKeyboardAwareScrollView>
        {!isKeyboardVisible && (
          <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-card p-8 pt-4">
            <Button size="sm" className="rounded-full">
              <Text>Start Session</Text>
            </Button>
          </View>
        )}
      </View>
    </StableSafeAreaView>
  );
};
