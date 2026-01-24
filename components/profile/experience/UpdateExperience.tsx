import { ApplicationHeader } from "@/components/shared/AppHeader";
import { FormBuilder } from "@/components/shared/form-builder/FormBuilder";
import { StableKeyboardAwareScrollView } from "@/components/shared/StableKeyboardAwareScrollView";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useUpdateExperienceFormStructure } from "./useUpdateExperienceFormStructure";
import { ServerErrorResponse, UpdateExperienceDto } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { showToastable } from "react-native-toastable";
import { updateExperienceSchema } from "@/types/validations/experience.validation";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface UpdateExperienceProps {
  className?: string;
}

export const UpdateExperience = ({ className }: UpdateExperienceProps) => {
  const { t } = useTranslation("common");
  const userStore = useUserStore();
  const queryClient = useQueryClient();

  const { structure } = useUpdateExperienceFormStructure({
    store: userStore,
  });

  const { mutate: updateExperience } = useMutation({
    mutationFn: (data: { id: number; experience: UpdateExperienceDto }) =>
      api.experience.update(data.id, data.experience),
    onSuccess: () => {
      showToastable({
        message: "Experience updated successfully",
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
        <Button className="mx-6 rounded-md mb-6" onPress={handleUpdateSubmit}>
          <Text>Update Experience</Text>
        </Button>
      </StableKeyboardAwareScrollView>
    </StableSafeAreaView>
  );
};
