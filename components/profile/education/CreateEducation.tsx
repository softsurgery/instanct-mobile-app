import { ApplicationHeader } from "@/components/shared/AppHeader";
import { FormBuilder } from "@/components/shared/form-builder/FormBuilder";
import { StableKeyboardAwareScrollView } from "@/components/shared/StableKeyboardAwareScrollView";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCreateEducationFormStructure } from "./useCreateEducationFormStructure";
import { CreateEducationDto, ServerErrorResponse } from "@/types";
import { showToastable } from "react-native-toastable";
import { api } from "@/api";
import { useTranslation } from "react-i18next";
import { createEducationSchema } from "@/types/validations/education.validation";
import { View } from "react-native";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";

interface CreateEducationProps {
  className?: string;
}

export const CreateEducation = ({ className }: CreateEducationProps) => {
  const { t } = useTranslation("common");
  const userStore = useUserStore();
  const queryClient = useQueryClient();
  const isKeyboardVisible = useKeyboardVisible();

  const { structure } = useCreateEducationFormStructure({
    store: userStore,
  });

  const { mutate: createEducation } = useMutation({
    mutationFn: (data: { id: string; education: CreateEducationDto }) =>
      api.education.create(data.id, data.education),
    onSuccess: () => {
      showToastable({
        message: "Education created successfully",
        status: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["educations", userStore.response?.id],
      });
      router.back();
    },
    onError: (error: ServerErrorResponse) => {
      showToastable({ message: error.response?.data?.message });
    },
  });

  const handleCreateSubmit = () => {
    const data = userStore.createEducationDto;
    const result = createEducationSchema.safeParse(data);
    if (!result.success) {
      userStore.set("educationErrors", result.error.flatten().fieldErrors);
    } else {
      if (userStore.response?.id) {
        createEducation({
          id: userStore.response?.id!,
          education: data,
        });
      }
    }
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2"
        title={t("screens.education")}
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
            Add your educational background — institutions, degrees, and any
            notable achievements.
          </Text>
        </View>
        <FormBuilder structure={structure} className="px-2" />
      </StableKeyboardAwareScrollView>
      {!isKeyboardVisible && (
        <View className="py-6 border-t border-border">
          <Button
            size="sm"
            className="mx-6 mb-4 rounded-full"
            onPress={handleCreateSubmit}
          >
            <Text>Create Education</Text>
          </Button>
        </View>
      )}
    </StableSafeAreaView>
  );
};
