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
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
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
      requestStore.setNested("createDto.latitude", latitude);
      requestStore.setNested("createDto.longitude", longitude);
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
  }, [id, user]);

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
      mutationFn: async (payload: typeof requestStore.createDto) =>
        api.request.send(payload),
      onSuccess: async () => {
        router.back();
        queryClient.invalidateQueries({ queryKey: ["outgoing-requests"] });
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
    const payload = { ...requestStore.createDto };

    if (!requestStore.flags.mentionTimeAndPlace) {
      payload.location = undefined;
      payload.latitude = undefined;
      payload.longitude = undefined;
      payload.time = undefined;
    }

    const result = CreateRequestDtoSchema(
      requestStore.flags.mentionTimeAndPlace,
    ).safeParse(payload);

    if (!result.success) {
      requestStore.set("errors", zodErrorsToNested(result.error));
      return;
    }
    sendRequest(result.data);
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
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
        <React.Fragment>
          <StableKeyboardAwareScrollView className="flex-1 bg-background">
            <Text className="text-lg font-semibold text-foreground mx-4 mt-4">
              Partenaire de réunion
            </Text>
            <View className="px-4 py-2">
              <View className="mt-4 flex-row items-center gap-4">
                <View className="overflow-hidden rounded-full bg-muted">
                  {profilePictures}
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">
                    {identity}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {user?.email}
                  </Text>
                </View>
              </View>
            </View>
            <FormBuilder structure={structure} className="mt-4 px-2" />
          </StableKeyboardAwareScrollView>
          {!isKeyboardVisible && (
            <View className="border-t border-border bg-card p-8 pt-4 gap-4">
              <View className="flex flex-col justify-between gap-2">
                <Button
                  size="lg"
                  variant="default"
                  className="rounded-xl"
                  onPress={() => handleSubmit()}
                  disabled={isSendingRequestPending}
                >
                  <Text>
                    {isSendingRequestPending
                      ? "Envoi en cours..."
                      : "Envoyer la demande"}
                  </Text>
                </Button>
              </View>
            </View>
          )}
        </React.Fragment>
      )}
    </StableSafeAreaView>
  );
};
