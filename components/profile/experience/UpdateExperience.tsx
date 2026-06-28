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
import { ArrowLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useUpdateExperienceFormStructure } from "./useUpdateExperienceFormStructure";
import { View } from "react-native";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { toast } from "sonner-native";
import React from "react";

import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
interface UpdateExperienceProps {
  className?: string;
}

export const UpdateExperience = ({ className }: UpdateExperienceProps) => {
  const { t } = useTranslation("common");
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
      toast.success("Experience updated successfully", {
        description: "Your experience has been successfully updated.",
      });
      queryClient.invalidateQueries({
        queryKey: ["experiences"],
      });

      router.back();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(error.response?.data?.message || "An error occurred", {});
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
            Please provide details about your experience. This information will
            help others understand your background and expertise.
          </Text>
        </View>
        <FormBuilder structure={structure} className="px-2" />
      </StableKeyboardAwareScrollView>

      {!isKeyboardVisible && (
        <View className="py-6 border-t border-border">
          <Button
            size="sm"
            className="mx-6 mb-4 rounded-full"
            onPress={handleUpdateSubmit}
          >
            <Text>Update Experience</Text>
          </Button>
        </View>
      )}
    </StableSafeAreaView>
  );
};
