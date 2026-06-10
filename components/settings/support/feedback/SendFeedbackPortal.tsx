import React from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "~/api";
import { View } from "react-native";
import { ArrowLeft, Loader2 } from "lucide-react-native";
import { Text } from "~/components/ui/text";
import { createFeedbackSchema } from "~/types/validations/system-reports.validation";
import { Button } from "~/components/ui/button";
import { FormBuilder } from "~/components/shared/form-builder/FormBuilder";
import { useSendFeedbackFormStructure } from "./useSendFeedbackFormStructure";
import { cn } from "~/lib/utils";
import { StableKeyboardAwareScrollView } from "~/components/shared/StableKeyboardAwareScrollView";
import { router } from "expo-router";
import { StableSafeAreaView } from "~/components/shared/StableSafeAreaView";
import { useTranslation } from "react-i18next";
import { ApplicationHeader } from "~/components/shared/AppHeader";
import { useSendFeedbackStore } from "@/stores/useFeedbackManager";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { ServerErrorResponse } from "@/types/utils/server.interfaces";
import { toast } from "sonner-native";
import { Icon } from "@/components/ui/icon";
import * as Haptics from "expo-haptics";

interface SendFeedbackPortalProps {
  className?: string;
}

export const SendFeedbackPortal = ({ className }: SendFeedbackPortalProps) => {
  const { t } = useTranslation("common");
  const isKeyboardVisible = useKeyboardVisible();
  const sendFeedbackStore = useSendFeedbackStore();

  React.useEffect(() => {
    return () => {
      sendFeedbackStore.reset();
    };
  }, []);

  const { feedbackFormStructure } = useSendFeedbackFormStructure({
    store: sendFeedbackStore,
  });

  const { mutate: sendFeedback, isPending: isSendFeedbackPending } =
    useMutation({
      mutationFn: async () => api.feedback.create(sendFeedbackStore.createDto),
      onSuccess: () => {
        toast.success("Feedback submitted successfully", {
          description: "Your feedback has been successfully submitted.",
        });
        router.back();
        sendFeedbackStore.reset();
      },
      onError: (error: ServerErrorResponse) => {
        toast.error("Oops! Failed to submit feedback", {
          description:
            error.response?.data?.message ||
            "An error occurred while submitting your feedback.",
        });
      },
    });

  const handleSubmit = () => {
    const result = createFeedbackSchema.safeParse(sendFeedbackStore.createDto);
    if (!result.success) {
      sendFeedbackStore.set("errors", result.error.flatten().fieldErrors);
    } else {
      sendFeedback();
    }
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.sendFeedback")}
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
            Have suggestions or ideas to make Instinct better? We&apos;d love to
            hear them!
          </Text>
        </View>
        <FormBuilder structure={feedbackFormStructure} className="px-2" />
      </StableKeyboardAwareScrollView>
      {!isKeyboardVisible && (
        <View className="border-t border-border bg-card p-8 pt-4 gap-4">
          <View className="flex flex-col justify-between gap-2">
            <Button
              size="lg"
              className="rounded-xl"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleSubmit();
              }}
              disabled={isSendFeedbackPending}
            >
              {isSendFeedbackPending ? (
                <React.Fragment>
                  <Icon
                    as={Loader2}
                    size={18}
                    className="text-primary-foreground animate-spin"
                  />
                  <Text className="text-primary-foreground font-semibold">
                    Sending...
                  </Text>
                </React.Fragment>
              ) : (
                <Text className="text-md font-bold">Send Feedback</Text>
              )}
            </Button>
          </View>
        </View>
      )}
    </StableSafeAreaView>
  );
};
