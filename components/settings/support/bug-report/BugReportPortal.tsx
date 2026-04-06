import React from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react-native";
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

interface BugReportPortalProps {
  className?: string;
}

export const BugReportPortal = ({ className }: BugReportPortalProps) => {
  const { t } = useTranslation("common");
  const isKeyboardVisible = useKeyboardVisible();

  React.useEffect(() => {
    return () => {
      bugStore.reset();
    };
  }, []);

  const bugStore = useReportBugStore();
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
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={t("screens.reportBug")}
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
            Encountered a bug? Let us know the details, and we&apos;ll work on
            fixing it as soon as possible!
          </Text>
        </View>
        <FormBuilder structure={bugFormStructure} className="px-2" />
      </StableKeyboardAwareScrollView>
      {!isKeyboardVisible && (
        <View className="py-6 border-t border-border">
          <Button
            size={"sm"}
            className="mx-6 mb-4 rounded-full"
            disabled={isReportBugPending}
            onPress={handleSubmit}
          >
            <Text>Submit Bug</Text>
          </Button>
        </View>
      )}
    </StableSafeAreaView>
  );
};
