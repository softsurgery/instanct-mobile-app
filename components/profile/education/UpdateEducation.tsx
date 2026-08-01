import { api } from "@/api";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { FormBuilder } from "@/components/shared/form-builder/FormBuilder";
import { StableKeyboardAwareScrollView } from "@/components/shared/StableKeyboardAwareScrollView";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { ServerErrorResponse, UpdateEducationDto } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useUpdateEducationFormStructure } from "./useUpdateEducationFormStructure";
import { updateEducationSchema } from "@/types/validations/education.validation";
import { View } from "react-native";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { toast } from "sonner-native";

import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
import { BottomButtonWrapper } from "@/components/shared/BottomButtonBlockWrapper";
interface UpdateEducationProps {
  className?: string;
}

export const UpdateEducation = ({ className }: UpdateEducationProps) => {
  const { t } = useTranslation("common");
  const { t: tMenu } = useTranslation("menu");
  const userStore = useUserStore();
  const queryClient = useQueryClient();
  const isKeyboardVisible = useKeyboardVisible();

  const { structure } = useUpdateEducationFormStructure({
    store: userStore,
  });

  const { mutate: updateEducation } = useMutation({
    mutationFn: (data: { id: number; education: UpdateEducationDto }) =>
      api.education.update(data.id, data.education),
    onSuccess: () => {
      toast.success(tMenu("education.toasts.updated"), {
        description: tMenu("education.toasts.updatedDescription"),
      });
      queryClient.invalidateQueries({
        queryKey: ["educations", userStore.response?.id],
      });
      router.back();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message || tMenu("education.toasts.error"),
        {},
      );
    },
  });

  const handleUpdateSubmit = () => {
    const data = userStore.updateEducationDto;
    const result = updateEducationSchema.safeParse(data);
    if (!result.success) {
      userStore.set("educationErrors", result.error.flatten().fieldErrors);
    } else {
      if (userStore.responseEducation?.id) {
        updateEducation({
          id: userStore.responseEducation.id,
          education: data,
        });
      }
    }
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.education")}
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
        <View className="p-4">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            {tMenu("education.form.description")}
          </Text>
        </View>
        <FormBuilder structure={structure} className="px-2" />
      </StableKeyboardAwareScrollView>
      {!isKeyboardVisible && (
        <BottomButtonWrapper>
          <Button size="lg" className="rounded-xl" onPress={handleUpdateSubmit}>
            <Text className="text-md font-bold">
              {tMenu("education.form.actions.update")}
            </Text>
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
