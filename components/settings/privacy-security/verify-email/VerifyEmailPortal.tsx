import { cn } from "@/lib/utils";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { StableKeyboardAwareScrollView } from "@/components/shared/StableKeyboardAwareScrollView";

interface VerifyEmailPortalProps {
  className?: string;
}

export const VerifyEmailPortal = ({ className }: VerifyEmailPortalProps) => {
  const { t } = useTranslation();
  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.verifyEmail", "Verify Email")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => router.back(),
          },
        ]}
      />
      <StableKeyboardAwareScrollView
        contentContainerClassName="px-4 py-4"
        className="flex-1 bg-background"
      ></StableKeyboardAwareScrollView>
    </StableSafeAreaView>
  );
};
