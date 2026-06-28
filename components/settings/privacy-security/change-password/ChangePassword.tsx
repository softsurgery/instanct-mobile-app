import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Lock, Loader2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { ApplicationHeader } from "~/components/shared/AppHeader";
import { StableSafeAreaView } from "~/components/shared/StableSafeAreaView";
import { StableKeyboardAwareScrollView } from "~/components/shared/StableKeyboardAwareScrollView";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { Text } from "~/components/ui/text";
import { FormBuilder } from "~/components/shared/form-builder/FormBuilder";
import { useChangePasswordFormStructure } from "./useChangePasswordFormStructure";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { useUserStore } from "@/stores/useUserStore";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { toast } from "sonner-native";
import { ServerErrorResponse } from "@/types";
import * as Haptics from "expo-haptics";
import { useLogout } from "@/hooks/useLogout";
import { BottomButtonWrapper } from "@/components/shared/BottomButtonBlockWrapper";

import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
interface ChangePasswordProps {
  className?: string;
}

export const ChangePassword = ({ className }: ChangePasswordProps) => {
  const { t } = useTranslation();
  const userStore = useUserStore();
  const isKeyboardVisible = useKeyboardVisible();
  const logout = useLogout();

  const { structure } = useChangePasswordFormStructure({
    store: userStore,
  });

  const { mutate: updatePassword, isPending } = useMutation({
    mutationFn: async () =>
      api.auth.updatePassword({
        currentPassword: userStore.updatePasswordDto.currentPassword!,
        newPassword: userStore.updatePasswordDto.newPassword!,
      }),
    onSuccess: () => {
      toast.success("Password updated successfully.");
      logout();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(error.response?.data?.message || "Failed to update password");
    },
  });

  const handleSave = () => {
    const { currentPassword, newPassword, confirmPassword } =
      userStore.updatePasswordDto;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    updatePassword();
  };

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
            render: <AppHeaderBack />,
          },
        ]}
      />
      <StableKeyboardAwareScrollView className="flex-1 bg-background">
        <View className="border border-primary/20 bg-primary/5 p-4">
          <View className="flex-row justify-center items-center gap-3">
            <Icon
              as={Lock}
              size={28}
              className="mt-0.5 flex-shrink-0 text-primary"
            />
            <Text className="flex-1 text-sm leading-5 text-muted-foreground">
              After changing your password, you may be asked to sign in again on
              other devices.
            </Text>
          </View>
        </View>
        <FormBuilder structure={structure} className="mt-4 px-2" />
      </StableKeyboardAwareScrollView>

      {!isKeyboardVisible && (
        <BottomButtonWrapper>
          <Button
            size="lg"
            className="rounded-xl"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleSave();
            }}
            disabled={isPending}
          >
            {isPending ? (
              <React.Fragment>
                <Icon
                  as={Loader2}
                  size={18}
                  className="text-primary-foreground animate-spin"
                />
                <Text className="text-primary-foreground font-semibold">
                  Updating...
                </Text>
              </React.Fragment>
            ) : (
              <Text className="text-md font-bold">Update Password</Text>
            )}
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
