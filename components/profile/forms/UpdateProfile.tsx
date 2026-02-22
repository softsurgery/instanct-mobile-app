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
import { ServerErrorResponse, UpdateUserDto, Upload } from "@/types";
import { showToastable } from "react-native-toastable";
import { api } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserSchema } from "@/types/validations/uservalidation";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import React from "react";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUserAvatar } from "@/lib/user";
import { useUploadMutation } from "@/hooks/useUploadMutation";

interface UpdateProfileProps {
  className?: string;
}

export const UpdateProfile = ({ className }: UpdateProfileProps) => {
  const { t } = useTranslation("common");
  const userStore = useUserStore();
  const queryClient = useQueryClient();

  const { mutate: updateUser, isPending: isUpdatePending } = useMutation({
    mutationFn: (user: UpdateUserDto) => api.user.updateCurrent(user),
    onSuccess: () => {
      router.back();
      showToastable({
        message: "Profile updated successfully",
        status: "success",
      });
      userStore.reset();
      queryClient.invalidateQueries({ queryKey: ["user", currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries({
        queryKey: ["server-image", currentUser?.pictureId],
      });
      refetchCurrentUser();
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

  const {
    uploadFiles: uploadProfilePicture,
    isUploadPending: isProfilePictureUploadPending,
  } = useUploadMutation({
    onSuccess: (response: Upload[]) => {
      userStore.setNested("updateDto.pictureId", response?.[0]?.id);
    },
    onError: (error: ServerErrorResponse) => {
      showToastable({
        message: error.response?.data?.message || "Failed to upload image",
        status: "danger",
      });
    },
  });

  const { structure } = useUpdateProfileFormStructure({
    store: userStore,
    uploadPicture: uploadProfilePicture,
    isProfilePictureUploadPending,
  });

  const { currentUser, refetchCurrentUser, isCurrentUserPending } =
    useCurrentUser();

  React.useEffect(() => {
    if (currentUser) {
      userStore.set("updateDto", {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        dateOfBirth: currentUser.dateOfBirth
          ? new Date(currentUser.dateOfBirth)
          : undefined,
        bio: currentUser.bio,
        gender: currentUser.gender,
      });
    }
    return () => {
      userStore.reset();
    };
  }, [currentUser]);

  const fallback = React.useMemo(
    () => identifyUserAvatar(currentUser),
    [currentUser],
  );

  const { uploads: profileUploads, isPending: isProfileUploadsPending } =
    useServerImages({
      ids: [currentUser?.pictureId],
      fallbacks: [fallback],
      size: { width: 100, height: 100 },
      enabled: !!currentUser,
    });

  React.useEffect(() => {
    if (
      profileUploads &&
      profileUploads[0] &&
      !userStore.hasInitializedPicture
    ) {
      userStore.set("picture", profileUploads[0] as string);
      userStore.set("hasInitializedPicture", true);
    }
  }, [profileUploads, currentUser?.pictureId]);

  return (
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={"Update Profile"}
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
      <StableKeyboardAwareScrollView className="flex-1 bg-background ">
        <FormBuilder structure={structure} className="mt-4 px-2" />
      </StableKeyboardAwareScrollView>
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-card p-8 pt-4">
        <Button
          size="sm"
          className="rounded-full"
          onPress={handleUpdateSubmit}
          disabled={isUpdatePending}
        >
          <Text>Update Profile</Text>
        </Button>
      </View>
    </StableSafeAreaView>
  );
};
