import React from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react-native";
import { View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { toast } from "sonner-native";
import { api } from "~/api";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { FormBuilder } from "~/components/shared/form-builder/FormBuilder";
import { cn } from "~/lib/utils";
import { StableKeyboardAwareScrollView } from "~/components/shared/StableKeyboardAwareScrollView";
import { StableSafeAreaView } from "~/components/shared/StableSafeAreaView";
import { ApplicationHeader } from "~/components/shared/AppHeader";
import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
import { BottomButtonWrapper } from "@/components/shared/BottomButtonBlockWrapper";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { useConversationReportStore } from "@/stores/useConversationReportStore";
import { createConversationReportSchema } from "@/types/validations/chat.validation";
import { ServerErrorResponse } from "@/types";
import { useConversationReportFormStructure } from "./useConversationReportFormStructure";
import { useTranslation } from "react-i18next";

interface ConversationReportPortalProps {
  conversationId: number;
  reportedUserName?: string;
  className?: string;
}

/**
 * Form portal screen allowing users to submit moderation reports against a conversation or participant.
 */
export const ConversationReportPortal = ({
  conversationId,
  reportedUserName,
  className,
}: ConversationReportPortalProps) => {
  const { t } = useTranslation("chat");
  const isKeyboardVisible = useKeyboardVisible();
  const reportStore = useConversationReportStore();

  React.useEffect(() => {
    return () => {
      reportStore.reset();
    };
  }, []);

  const { reportFormStructure } = useConversationReportFormStructure({
    store: reportStore,
  });

  const { mutate: submitReport, isPending: isSubmitReportPending } = useMutation(
    {
      mutationFn: async () =>
        api.chat.conversation.reportConversation(
          conversationId,
          reportStore.createDto,
        ),
      onSuccess: () => {
        toast.success(t("chat.report.toasts.success.title"), {
          description: t("chat.report.toasts.success.description"),
        });
        router.back();
        reportStore.reset();
      },
      onError: (error: ServerErrorResponse) => {
        toast.error(t("chat.report.toasts.error.title"), {
          description:
            error.response?.data?.message ||
            t("chat.report.toasts.error.description"),
        });
      },
    },
  );

  /**
   * Validates form store values with Zod schema before triggering report API mutation.
   */
  const handleSubmit = () => {
    const result = createConversationReportSchema.safeParse(reportStore.createDto);
    if (!result.success) {
      reportStore.set("errors", result.error.flatten().fieldErrors);
      return;
    }

    submitReport();
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("chat.report.title")}
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
            {reportedUserName
              ? t("chat.report.descriptionWithName", {
                  name: reportedUserName,
                })
              : t("chat.report.description")}
          </Text>
        </View>
        <FormBuilder structure={reportFormStructure} className="px-2" />
      </StableKeyboardAwareScrollView>
      {!isKeyboardVisible && (
        <BottomButtonWrapper>
          <Button
            size="lg"
            className="rounded-xl"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleSubmit();
            }}
            disabled={isSubmitReportPending}
          >
            {isSubmitReportPending ? (
              <React.Fragment>
                <Icon
                  as={Loader2}
                  size={18}
                  className="text-primary-foreground animate-spin"
                />
                <Text className="text-primary-foreground font-semibold">
                  {t("chat.report.actions.submitPending")}
                </Text>
              </React.Fragment>
            ) : (
              <Text className="text-md font-bold">
                {t("chat.report.actions.submit")}
              </Text>
            )}
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
