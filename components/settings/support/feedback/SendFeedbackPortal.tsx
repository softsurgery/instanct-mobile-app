import React from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "~/api";
import { View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
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

interface SendFeedbackPortalProps {
  className?: string;
}

export const SendFeedbackPortal = ({ className }: SendFeedbackPortalProps) => {
  const { t } = useTranslation("common");
  const isKeyboardVisible = useKeyboardVisible();

  React.useEffect(() => {
    return () => {
      sendFeedbackStore.reset();
    };
  }, []);

  const sendFeedbackStore = useSendFeedbackStore();
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
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2 bg-transparent" }}
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
        <View className="p-4">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            Have suggestions or ideas to make Instinct better? We&apos;d love to
            hear them!
          </Text>
        </View>
        <FormBuilder structure={feedbackFormStructure} className="px-2" />
      </StableKeyboardAwareScrollView>
      {!isKeyboardVisible && (
        <View className="py-6 border-t border-border">
          <Button
            size={"sm"}
            className="mx-6 mb-4 rounded-full"
            disabled={isSendFeedbackPending}
            onPress={handleSubmit}
          >
            <Text>Send Feedback</Text>
          </Button>
        </View>
      )}
    </StableSafeAreaView>
  );
};
