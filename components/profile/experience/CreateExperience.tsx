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
import { useCreateExperienceFormStructure } from "./useCreateExperienceFormStructure";
import { CreateExperienceDto, ServerErrorResponse } from "@/types";
import { showToastable } from "react-native-toastable";
import { api } from "@/api";
import { useTranslation } from "react-i18next";
import { createExperienceSchema } from "@/types/validations/experience.validation";

interface CreateExperienceProps {
  className?: string;
}

export const CreateExperience = ({ className }: CreateExperienceProps) => {
  const { t } = useTranslation("common");
  const userStore = useUserStore();
  const queryClient = useQueryClient();

  const { structure } = useCreateExperienceFormStructure({
    store: userStore,
  });

  const { mutate: createExperience } = useMutation({
    mutationFn: (data: { id: string; experience: CreateExperienceDto }) =>
      api.experience.create(data.id, data.experience),
    onSuccess: () => {
      showToastable({
        message: "Experience created successfully",
        status: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["experiences", userStore.response?.id],
      });
      router.back();
    },
    onError: (error: ServerErrorResponse) => {
      showToastable({ message: error.response?.data?.message });
    },
  });

  const handleCreateSubmit = () => {
    const data = userStore.createExperienceDto;
    const result = createExperienceSchema.safeParse(data);
    if (!result.success) {
      userStore.set("experienceErrors", result.error.flatten().fieldErrors);
    } else {
      if (userStore.response?.id) {
        createExperience({
          id: userStore.response?.id!,
          experience: data,
        });
      }
    }
  };

  return (
    <StableSafeAreaView className={cn("flex flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={t("screens.experience")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => {
              router.back();
            },
          },
        ]}
      />
      <StableKeyboardAwareScrollView
        className={cn("flex flex-col flex-1 py-2", className)}
      >
        <FormBuilder structure={structure} className="mb-6" />
        <Button className="mx-6 rounded-md mb-6" onPress={handleCreateSubmit}>
          <Text>Create Experience</Text>
        </Button>
      </StableKeyboardAwareScrollView>
    </StableSafeAreaView>
  );
};
