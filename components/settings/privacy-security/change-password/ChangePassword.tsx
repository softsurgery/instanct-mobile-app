import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Lock } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { ApplicationHeader } from "~/components/shared/AppHeader";
import { StableSafeAreaView } from "~/components/shared/StableSafeAreaView";
import { StableKeyboardAwareScrollView } from "~/components/shared/StableKeyboardAwareScrollView";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { Text } from "~/components/ui/text";
import { FormBuilder } from "~/components/shared/form-builder/FormBuilder";
import { useChangePasswordFormStructure } from "./forms/useChangePasswordFormStructure";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { useUserStore } from "@/stores/useUserStore";

interface ChangePasswordProps {
  className?: string;
}

export const ChangePassword = ({ className }: ChangePasswordProps) => {
  const { t } = useTranslation();
  const userStore = useUserStore();
  const isKeyboardVisible = useKeyboardVisible();

  const { structure } = useChangePasswordFormStructure({
    store: userStore,
  });

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.changePassword", "Change Password")}
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
        <FormBuilder structure={structure} className="mt-4 px-2" />
        <View className="border border-primary/20 bg-primary/5 p-4">
          <View className="flex-row gap-3">
            <Icon
              as={Lock}
              size={16}
              className="mt-0.5 flex-shrink-0 text-primary"
            />
            <Text className="flex-1 text-xs leading-5 text-muted-foreground">
              After changing your password, you may be asked to sign in again on
              other devices.
            </Text>
          </View>
        </View>
      </StableKeyboardAwareScrollView>

      {!isKeyboardVisible && (
        <View className="border-t border-border bg-card p-8 pt-4 gap-4">
          <View className="flex flex-row justify-between gap-4">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-full"
              onPress={() => router.back()}
            >
              <Text className="font-semibold">Cancel</Text>
            </Button>
            <Button size="sm" className="flex-1 rounded-full">
              <Text>Update Password</Text>
            </Button>
          </View>
        </View>
      )}
    </StableSafeAreaView>
  );
};
