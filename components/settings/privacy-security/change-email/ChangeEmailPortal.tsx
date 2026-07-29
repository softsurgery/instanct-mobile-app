import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Loader2 } from "lucide-react-native";
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
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { toast } from "sonner-native";
import { ServerErrorResponse } from "@/types";
import { Icon } from "@/components/ui/icon";
import { BottomButtonWrapper } from "@/components/shared/BottomButtonBlockWrapper";
import { AppHeaderBack } from "@/components/shared/AppHeaderBack";

interface ChangeEmailPortalProps {
  className?: string;
}

export const ChangeEmailPortal = ({ className }: ChangeEmailPortalProps) => {
  const isKeyboardVisible = useKeyboardVisible();
  const { t } = useTranslation("settings");
  const userStore = useUserStore();
  const { currentUser } = useCurrentUser();

  React.useEffect(() => {
    if (currentUser) {
      userStore.set("response", currentUser);
    }
  }, [currentUser]);

  const { updateMailFormStructure } = useChangeEmailFormStructure({
    store: userStore,
  });

  const { mutate: updateEmail, isPending } = useMutation({
    mutationFn: async () =>
      api.auth.updateEmail({
        email: userStore.updateDto.email!,
        password: userStore.updateDto.password!,
      }),
    onSuccess: () => {
      toast.success(
        "Email update initiated. Please check your new email to verify.",
      );
      router.back();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(error.response?.data?.message || "Failed to update email");
    },
  });

  const handleSave = () => {
    if (!userStore.updateDto.email || !userStore.updateDto.password) {
      toast.error("Please fill in all fields");
      return;
    }
    updateEmail();
  };

  if (!currentUser) return null;
  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t(
          "settings.account.screens.privacy-security.screens.account-security.change-email.title",
          "Update Email",
        )}
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
        <View className="px-5 pt-4 pb-2">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            {t(
              "settings.account.screens.privacy-security.screens.account-security.change-email.forms.description",
            )}
          </Text>
        </View>
        <FormBuilder className="px-2" structure={updateMailFormStructure} />
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
                  {t(
                    "settings.account.screens.privacy-security.screens.account-security.change-email.forms.actions.update-email-pending",
                  )}
                </Text>
              </React.Fragment>
            ) : (
              <Text className="text-md font-bold">
                {t(
                  "settings.account.screens.privacy-security.screens.account-security.change-email.forms.actions.update-email",
                )}
              </Text>
            )}
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
