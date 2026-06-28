import React from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react-native";
import { api } from "~/api";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { View } from "react-native";
import { useBugReportFormStructure } from "./useBugReportFormStructure";
import { FormBuilder } from "~/components/shared/form-builder/FormBuilder";
import { cn } from "~/lib/utils";
import { StableKeyboardAwareScrollView } from "~/components/shared/StableKeyboardAwareScrollView";
import { router } from "expo-router";
import { StableSafeAreaView } from "~/components/shared/StableSafeAreaView";
import { ApplicationHeader } from "~/components/shared/AppHeader";
import { useTranslation } from "react-i18next";
import { createBugSchema } from "@/types/validations/system-reports.validation";
import { useReportBugStore } from "@/stores/useReportBugStore";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { toast } from "sonner-native";
import { ServerErrorResponse } from "@/types";
import { Icon } from "@/components/ui/icon";
import * as Haptics from "expo-haptics";
import { BottomButtonWrapper } from "@/components/shared/BottomButtonBlockWrapper";

import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
interface BugReportPortalProps {
  className?: string;
}

export const BugReportPortal = ({ className }: BugReportPortalProps) => {
  const { t } = useTranslation("common");
  const isKeyboardVisible = useKeyboardVisible();
  const bugStore = useReportBugStore();

  React.useEffect(() => {
    return () => {
      bugStore.reset();
    };
  }, []);

  const { bugFormStructure } = useBugReportFormStructure({ store: bugStore });

  const { mutate: reportBug, isPending: isReportBugPending } = useMutation({
    mutationFn: async () => api.bug.create(bugStore.createDto),
    onSuccess: () => {
      toast.success("Bug reported successfully", {
        description: "Your bug report has been successfully submitted.",
      });
      router.back();
      bugStore.reset();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error("Oops! Failed to submit bug report", {
        description:
          error.response?.data?.message ||
          "An error occurred while submitting your bug report.",
      });
    },
  });

  const handleSubmit = () => {
    const result = createBugSchema.safeParse(bugStore.createDto);
    if (!result.success) {
      bugStore.set("errors", result.error.flatten().fieldErrors);
    } else {
      reportBug();
    }
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.settings.reportBug")}
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
            Encountered a bug? Let us know the details, and we&apos;ll work on
            fixing it as soon as possible!
          </Text>
        </View>
        <FormBuilder structure={bugFormStructure} className="px-2" />
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
            disabled={isReportBugPending}
          >
            {isReportBugPending ? (
              <React.Fragment>
                <Icon
                  as={Loader2}
                  size={18}
                  className="text-primary-foreground animate-spin"
                />
                <Text className="text-primary-foreground font-semibold">
                  Submitting...
                </Text>
              </React.Fragment>
            ) : (
              <Text className="text-md font-bold">Submit Bug</Text>
            )}
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
