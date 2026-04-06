import { api } from "@/api";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { FormBuilder } from "@/components/shared/form-builder/FormBuilder";
import { StableKeyboardAwareScrollView } from "@/components/shared/StableKeyboardAwareScrollView";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { CreateExperienceDto, ServerErrorResponse } from "@/types";
import { createExperienceSchema } from "@/types/validations/experience.validation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { useCreateExperienceFormStructure } from "./useCreateExperienceFormStructure";
import { toast } from "sonner-native";

interface CreateExperienceProps {
  className?: string;
}

export const CreateExperience = ({ className }: CreateExperienceProps) => {
  const { t } = useTranslation("common");
  const isKeyboardVisible = useKeyboardVisible();
  const userStore = useUserStore();
  const queryClient = useQueryClient();

  const { structure } = useCreateExperienceFormStructure({
    store: userStore,
  });

  const { mutate: createExperience } = useMutation({
    mutationFn: (data: { id: string; experience: CreateExperienceDto }) =>
      api.experience.create(data.id, data.experience),
    onSuccess: () => {
      toast.success("Experience created successfully", {
        description: "Your experience has been successfully created.",
      });
      queryClient.invalidateQueries({
        queryKey: ["experiences", userStore.response?.id],
      });
      router.back();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(error.response?.data?.message || "An error occurred", {});
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
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2"
        title={"Add Experience"}
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

      {/* Scrollable content */}
      <StableKeyboardAwareScrollView className="flex-1 bg-background">
        <View className="p-4">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            Please provide details about your experience. This information will
            help others understand your background and expertise.
          </Text>
        </View>
        <FormBuilder structure={structure} className="px-2" />
      </StableKeyboardAwareScrollView>

      {/* Sticky bottom button */}
      {!isKeyboardVisible && (
        <View className="py-6 border-t border-border">
          <Button
            size="sm"
            className="mx-6 mb-4 rounded-full"
            onPress={handleCreateSubmit}
          >
            <Text>Create Experience</Text>
          </Button>
        </View>
      )}
    </StableSafeAreaView>
  );
};
