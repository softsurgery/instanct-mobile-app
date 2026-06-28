import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { ApplicationHeader } from "../../shared/AppHeader";
import { FormBuilder } from "../../shared/form-builder/FormBuilder";
import { StableKeyboardAwareScrollView } from "../../shared/StableKeyboardAwareScrollView";
import { StableSafeAreaView } from "../../shared/StableSafeAreaView";
import { useUpdateProfileFormStructure } from "./useUpdateProfileFormStructure";
import { ServerErrorResponse, UpdateUserDto, Upload } from "@/types";
import { api } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserSchema } from "@/types/validations/user.validation";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import React from "react";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUserAvatar } from "@/lib/user";
import { useUploadMutation } from "@/hooks/useUploadMutation";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { toast } from "sonner-native";
import { BottomButtonWrapper } from "@/components/shared/BottomButtonBlockWrapper";
import { useTranslation } from "react-i18next";
import { AppHeaderBack } from "@/components/shared/AppHeaderBack";

interface UpdateProfileProps {
  className?: string;
}

export const UpdateProfile = ({ className }: UpdateProfileProps) => {
  const isKeyboardVisible = useKeyboardVisible();
  const userStore = useUserStore();
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");

  const { mutate: updateUser, isPending: isUpdatePending } = useMutation({
    mutationFn: (user: UpdateUserDto) => api.user.updateCurrent(user),
    onSuccess: () => {
      router.back();
      toast.success("Profile updated successfully", {
        description: "Your profile has been successfully updated.",
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
      toast.error(
        error.response?.data?.message || "Failed to update profile",
        {},
      );
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
      toast.error(
        error.response?.data?.message || "Failed to upload image",
        {},
      );
    },
  });

  const { currentUser, refetchCurrentUser, isCurrentUserPending } =
    useCurrentUser();

  const fallback = React.useMemo(
    () => identifyUserAvatar(currentUser),
    [currentUser],
  );

  const { structure } = useUpdateProfileFormStructure({
    store: userStore,
    fallback,
    uploadPicture: uploadProfilePicture,
    isProfilePictureUploadPending,
  });

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
        website: currentUser.website,
        linkedin: currentUser.linkedin,
      });
    }
    return () => {
      userStore.reset();
    };
  }, [currentUser]);

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
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("settings.account.screens.profile.title")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
           render: <AppHeaderBack />
          },
        ]}
      />
      <StableKeyboardAwareScrollView className="flex-1 bg-background">
        <FormBuilder structure={structure} className="px-2" />
      </StableKeyboardAwareScrollView>
      {!isKeyboardVisible && (
        <BottomButtonWrapper>
          <Button
            size="lg"
            variant="default"
            className="rounded-xl"
            onPress={() => {
              handleUpdateSubmit();
            }}
            disabled={isUpdatePending}
          >
            <Text className="text-md font-bold">
              {isUpdatePending
                ? t(
                    "settings.account.screens.profile.actions.update-profile-pending",
                  )
                : t("settings.account.screens.profile.actions.update-profile")}
            </Text>
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
