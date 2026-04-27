import React from "react";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { X } from "lucide-react-native";
import { View } from "react-native";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { router } from "expo-router";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { useServerImages } from "@/hooks/content/useServerImages";
import { cn } from "@/lib/utils";
import { FormBuilder } from "../shared/form-builder/FormBuilder";
import { useCreateNewRequestFormStructure } from "./forms/useCreateRequestFormStructure";
import { useRequestStore } from "@/stores/useRequestStore";
import { StableKeyboardAwareScrollView } from "../shared/StableKeyboardAwareScrollView";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { toast } from "sonner-native";
import { ServerErrorResponse } from "@/types";
import { CreateRequestDtoSchema } from "@/types/validations/request.validation";
import { zodErrorsToNested } from "@/lib/object";
import { useMapStore } from "@/stores/useMapStore";
import { Loader } from "../shared/Loader";

interface NewRequestProps {
  className?: string;
  id: string;
}

export const NewRequest = ({ className, id }: NewRequestProps) => {
  const isKeyboardVisible = useKeyboardVisible();
  const requestStore = useRequestStore();
  const { user, isUserPending } = useIdentifiedUser({ id });
  const mapStore = useMapStore();

  const { latitude, longitude } = mapStore?.location?.coords || {
    latitude: 0,
    longitude: 0,
  };

  React.useEffect(() => {
    if (latitude && longitude && !requestStore.flags.initialLocationSet) {
      requestStore.setNested("flags.location", { latitude, longitude });
      requestStore.setNested("flags.initialLocationSet", true);
    }
  }, [latitude, longitude]);

  React.useEffect(() => {
    if (user) {
      requestStore.setNested("createDto.receiverIds", [id]);
    }
    return () => {
      requestStore.reset();
    };
  }, [id]);

  const identity = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsxArray: profilePictures, isPending: isProfilePicturesPending } =
    useServerImages({
      ids: [user?.pictureId],
      fallbacks: [fallback],
      wrapperClassName:
        "border border-border bg-background rounded-full shadow-md",
      size: { width: 70, height: 70 },
      enabled: !!user,
    });

  const { mutate: sendRequest, isPending: isSendingRequestPending } =
    useMutation({
      mutationFn: async () => api.request.send(requestStore.createDto),
      onSuccess: async () => {
        router.back();
        toast.success("Demande envoyée avec succès");
        requestStore.reset();
      },
      onError: (error: ServerErrorResponse) => {
        toast.error(error.response?.data?.message || "Une erreur est survenue");
      },
    });

  const { structure } = useCreateNewRequestFormStructure({
    store: requestStore,
  });

  const handleSubmit = () => {
    const result = CreateRequestDtoSchema(
      requestStore.flags.mentionTimeAndPlace,
    ).safeParse(requestStore.createDto);

    if (!result.success) {
      requestStore.set("errors", zodErrorsToNested(result.error));
      return;
    }
    sendRequest();
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2"
        title={"Demande de rendez-vous"}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: X,
            onPress: () => router.back(),
          },
        ]}
      />

      {isUserPending || isProfilePicturesPending ? (
        <Loader className="flex flex-1 h-full items-center justify-center" />
      ) : (
        <>
          <StableKeyboardAwareScrollView className="flex-1 bg-background">
            <View className="px-4 pt-4">
              <Text className="text-lg font-semibold text-foreground">
                Partenaire de réunion
              </Text>

              <View className="mt-4 flex-row items-center gap-4">
                <View className="overflow-hidden rounded-full bg-muted">
                  {profilePictures}
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">
                    {identity}
                  </Text>
                  <Text className="text-lg opacity-50">{user?.email}</Text>
                </View>
              </View>
            </View>
            <FormBuilder structure={structure} className="mt-4 px-2" />
          </StableKeyboardAwareScrollView>
          {!isKeyboardVisible && (
            <View className="py-6 border-t border-border">
              <Button
                size={"sm"}
                className="mx-6 mb-4 rounded-full"
                onPress={() => handleSubmit()}
                disabled={isSendingRequestPending}
              >
                <Text>Envoyer une demande</Text>
              </Button>
            </View>
          )}
        </>
      )}
    </StableSafeAreaView>
  );
};
