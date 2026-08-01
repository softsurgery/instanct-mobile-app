import { api } from "@/api";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { FormBuilder } from "@/components/shared/form-builder/FormBuilder";
import { StableKeyboardAwareScrollView } from "@/components/shared/StableKeyboardAwareScrollView";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { ServerErrorResponse, UpdateExperienceDto } from "@/types";
import { updateExperienceSchema } from "@/types/validations/experience.validation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useUpdateExperienceFormStructure } from "./useUpdateExperienceFormStructure";
import { View } from "react-native";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { toast } from "sonner-native";
import React from "react";

import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
import { BottomButtonWrapper } from "@/components/shared/BottomButtonBlockWrapper";
interface UpdateExperienceProps {
  className?: string;
}

export const UpdateExperience = ({ className }: UpdateExperienceProps) => {
  const { t } = useTranslation("common");
  const { t: tMenu } = useTranslation("menu");
  const userStore = useUserStore();
  const queryClient = useQueryClient();
  const isKeyboardVisible = useKeyboardVisible();

  const { structure } = useUpdateExperienceFormStructure({
    store: userStore,
  });

  const { mutate: updateExperience } = useMutation({
    mutationFn: (data: { id: number; experience: UpdateExperienceDto }) =>
      api.experience.update(data.id, data.experience),
    onSuccess: () => {
      toast.success(tMenu("experience.toasts.updated"), {
        description: tMenu("experience.toasts.updatedDescription"),
      });
      queryClient.invalidateQueries({
        queryKey: ["experiences"],
      });

      router.back();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message || tMenu("experience.toasts.error"),
        {},
      );
    },
  });

  const handleUpdateSubmit = () => {
    const data = userStore.updateExperienceDto;
    const result = updateExperienceSchema.safeParse(data);
    if (!result.success) {
      userStore.set("experienceErrors", result.error.flatten().fieldErrors);
    } else {
      if (userStore.responseExperience?.id) {
        updateExperience({
          id: userStore.responseExperience.id,
          experience: data,
        });
      }
    }
  };

  React.useEffect(() => {
    return () => {
      userStore.reset();
    };
  }, []);

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.experience")}
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
            {tMenu("experience.form.description")}
          </Text>
        </View>
        <FormBuilder structure={structure} className="px-2" />
      </StableKeyboardAwareScrollView>

      {!isKeyboardVisible && (
        <BottomButtonWrapper>
          <Button size="lg" className="rounded-xl" onPress={handleUpdateSubmit}>
            <Text>{tMenu("experience.form.actions.update")}</Text>
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
