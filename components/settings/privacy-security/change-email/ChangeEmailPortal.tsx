import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { ApplicationHeader } from "~/components//shared/AppHeader";
import { StableSafeAreaView } from "~/components//shared/StableSafeAreaView";
import { StableKeyboardAwareScrollView } from "~/components//shared/StableKeyboardAwareScrollView";
import { FormBuilder } from "@/components/shared/form-builder/FormBuilder";
import { useChangeEmailFormStructure } from "./useChangeEmailFormStructure";
import { useUserStore } from "@/stores/useUserStore";
import { Text } from "@/components/ui/text";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { Button } from "@/components/ui/button";
import * as Haptics from "expo-haptics";

interface ChangeEmailPortalProps {
  className?: string;
}

export const ChangeEmailPortal = ({ className }: ChangeEmailPortalProps) => {
  const isKeyboardVisible = useKeyboardVisible();
  const { t } = useTranslation();
  const userStore = useUserStore();
  const { updateMailFormStructure } = useChangeEmailFormStructure({
    store: userStore,
  });

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.changeEmail", "Change Email")}
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

      <StableKeyboardAwareScrollView className="flex-1 bg-background">
        <View className="px-5 pt-4 pb-2">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            To change your email, we need to verify your identity. Please enter
            your current email and password to proceed.
          </Text>
        </View>
        <FormBuilder className="px-2" structure={updateMailFormStructure} />
      </StableKeyboardAwareScrollView>
      {!isKeyboardVisible && (
        <View className="border-t border-border bg-card p-8 pt-4 gap-4">
          <View className="flex flex-col justify-between gap-2">
            <Button
              size="lg"
              className="rounded-xl"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                // handleSave();
              }}
              // disabled={isPending}
            >
              {/* {isPending ? (
                <React.Fragment>
                  <Icon
                    as={Loader2}
                    size={18}
                    className="text-primary-foreground animate-spin"
                  />
                  <Text className="text-primary-foreground font-semibold">
                    Saving...
                  </Text>
                </React.Fragment>
              ) : ( */}
              <Text className="text-primary-foreground font-semibold">
                Update Email
              </Text>
              {/* )} */}
            </Button>
          </View>
        </View>
      )}
    </StableSafeAreaView>
  );
};
