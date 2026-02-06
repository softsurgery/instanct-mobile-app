import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ApplicationHeader } from "../../shared/AppHeader";
import { FormBuilder } from "../../shared/form-builder/FormBuilder";
import { StableKeyboardAwareScrollView } from "../../shared/StableKeyboardAwareScrollView";
import { StableSafeAreaView } from "../../shared/StableSafeAreaView";
import { useUpdateProfileFormStructure } from "./useUpdateProfileFormStructure";
import { ServerErrorResponse, UpdateUserDto } from "@/types";
import { showToastable } from "react-native-toastable";
import { api } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserSchema } from "@/types/validations/uservalidation";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface UpdateProfileProps {
  className?: string;
}

export const UpdateProfile = ({ className }: UpdateProfileProps) => {
  const { t } = useTranslation("common");
  const userStore = useUserStore();
  const queryClient = useQueryClient();

  const { structure } = useUpdateProfileFormStructure({
    store: userStore,
  });

  const { mutate: updateUser, isPending: isUpdatePending } = useMutation({
    mutationFn: (user: UpdateUserDto) => api.user.updateCurrent(user),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", userStore.response?.email],
      });
      showToastable({
        message: "Profile updated successfully",
        status: "success",
      });
      userStore.reset();
    },
    onError: (error: ServerErrorResponse) => {
      showToastable({
        message: error.response?.data?.message,
        status: "danger",
      });
    },
  });

  const handleUpdateSubmit = () => {
    const data = userStore.updateDto;
    const result = updateUserSchema().safeParse({
      ...data,
    });
    if (!result.success) {
      userStore.set("errors", result.error.flatten().fieldErrors);
    } else {
      updateUser(data);
    }
  };
  return (
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={t("screens.profile")}
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
        <FormBuilder structure={structure} className="mt-4 px-2" />
      </StableKeyboardAwareScrollView>
      <View className="py-6 border-t border-border">
        <Button
          size="sm"
          className="mx-6 mb-4 rounded-full"
          onPress={handleUpdateSubmit}
        >
          <Text>Update Profile</Text>
        </Button>
      </View>
    </StableSafeAreaView>
  );
};
