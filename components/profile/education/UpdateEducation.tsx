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
import { ArrowLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { showToastable } from "react-native-toastable";
import { useUpdateEducationFormStructure } from "./useUpdateEducationFormStructure";
import { updateEducationSchema } from "@/types/validations/education.validation";

interface UpdateEducationProps {
  className?: string;
}

export const UpdateEducation = ({ className }: UpdateEducationProps) => {
  const { t } = useTranslation("common");
  const userStore = useUserStore();
  const queryClient = useQueryClient();

  const { structure } = useUpdateEducationFormStructure({
    store: userStore,
  });

  const { mutate: updateEducation } = useMutation({
    mutationFn: (data: { id: number; education: UpdateEducationDto }) =>
      api.education.update(data.id, data.education),
    onSuccess: () => {
      showToastable({
        message: "Education updated successfully",
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
    <StableSafeAreaView className={cn("flex flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={t("screens.education")}
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
        className={cn("flex flex-col flex-1 py-2 bg-background", className)}
      >
        <FormBuilder structure={structure} className="mb-6" />
      </StableKeyboardAwareScrollView>
        <Button className="mx-6 rounded-md mb-6" onPress={handleUpdateSubmit}>
          <Text>Update Education</Text>
        </Button>
    </StableSafeAreaView>
  );
};
