import React from "react";
import { cn } from "@/lib/utils";
import { View } from "react-native";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { useSessionStore } from "@/stores/useSessionStore";
import { toast } from "sonner-native";
import { ServerErrorResponse } from "@/types";
import { router } from "expo-router";
import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { useSessionManagementFormStructure } from "./useSessionManagementFormStructure";
import { mapToSelectOptions } from "../shared/form-builder/utils/map-select-options";
import {
  createSessionSchema,
  updateSessionSchema,
} from "@/types/validations/session.validation";
import { zodErrorsToNested } from "@/lib/object";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { ApplicationHeader } from "../shared/AppHeader";
import { ArrowLeft } from "lucide-react-native";
import { StableKeyboardAwareScrollView } from "../shared/StableKeyboardAwareScrollView";
import { FormBuilder } from "../shared/form-builder/FormBuilder";
import { api } from "@/api";
import { useActiveSessions } from "@/hooks/content/sessions/useActiveSessions";

interface SessionManagePortalProps {
  className?: string;
}

export const SessionManagePortal = ({
  className,
}: SessionManagePortalProps) => {
  const { mapSession, refetchSessions } = useActiveSessions();

  const queryClient = useQueryClient();
  const isKeyboardVisible = useKeyboardVisible();
  const sessionStore = useSessionStore();

  React.useEffect(() => {
    if (mapSession) {
      sessionStore.set("updateDto", {
        payload: mapSession.payload,
        plannedEnd: mapSession.plannedEnd
          ? new Date(mapSession.plannedEnd)
          : new Date(),
      });
    }
    return () => {
      sessionStore.reset();
    };
  }, [mapSession]);

  const { mutate: endSession, isPending: isEndingSessionPending } = useMutation(
    {
      mutationFn: async () => api.session.end(mapSession?.id!),
      onSuccess: (data) => {
        toast.success("Session ended successfully!", {});
        queryClient.invalidateQueries({
          queryKey: ["sessions"],
        });
        refetchSessions();
        router.replace(`/main/(tabs)`);
      },
      onError: (error: ServerErrorResponse) => {
        toast.error(error.response?.data?.message || "An error occurred", {});
      },
    },
  );

  // session start mutation
  const { mutate: updateSession, isPending: isUpdatingSession } = useMutation({
    mutationFn: async () =>
      api.session.update(mapSession?.id!, sessionStore.updateDto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session updated successfully!", {
        description: "Your session has been successfully updated.",
      });
      router.replace(`/main/(tabs)`);
      sessionStore.reset();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error("Failed to update session", {
        description:
          error.message || "An error occurred while updating the session.",
      });
    },
  });

  const { objectives, isObjectivesSubTypePending } = useObjectives();

  const { structure } = useSessionManagementFormStructure({
    store: sessionStore,
    objectives: mapToSelectOptions({
      data: objectives,
      labelKey: "label",
      valueKey: "id",
    }),
    isPending: isUpdatingSession || isObjectivesSubTypePending,
  });

  const isEndDateNextDay = React.useMemo(() => {
    const { plannedStart, plannedEnd } = sessionStore.createDto;

    if (!plannedStart || !plannedEnd) return false;

    const start = new Date(plannedStart);
    const end = new Date(plannedEnd);

    return end < start;
  }, [sessionStore.createDto]);

  const handleSessionEdit = () => {
    const result = updateSessionSchema.safeParse(sessionStore.updateDto);
    if (!result.success) {
      sessionStore.set("errors", zodErrorsToNested(result.error));
    } else {
      updateSession();
    }
  };

  const isPending = isEndingSessionPending || isUpdatingSession;

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2"
        title={"Gestion de session active"}
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
      <StableKeyboardAwareScrollView className="flex-1 bg-background">
        <View className="p-4">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            Veuillez configurer les paramètres de votre session afin de pouvoir
            modifier ou compléter les informations de votre session en cours.
            Vous pouvez notamment ajuster l&apos;heure de fin, ajouter des
            objectifs, et bien plus encore.
          </Text>
        </View>
        <FormBuilder structure={structure} className="px-2" />
        {/* {isEndDateNextDay && sessionStore.createDto && (
          <View className="mx-4 mt-4 p-4 rounded-lg bg-destructive/25">
            <Text className="text-sm">
              Votre session se terminera le jour suivant car l&apos;heure de fin
              est antérieure à l&apos;heure de début.
            </Text>
          </View>
        )} */}
      </StableKeyboardAwareScrollView>
      {!isKeyboardVisible && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-card p-8 pt-4 gap-4">
          <View className="flex flex-row justify-between gap-4">
            <Button
              size="sm"
              className="rounded-full flex-1"
              onPress={() => handleSessionEdit()}
              disabled={isUpdatingSession}
            >
              <Text>Confirm</Text>
            </Button>
            <Button
              variant="destructive"
              onPress={() => {
                endSession();
              }}
              disabled={isPending}
              size="sm"
              className="rounded-full flex-1"
            >
              <Text>{isPending ? "Ending..." : "Terminer la session"}</Text>
            </Button>
          </View>
        </View>
      )}
    </StableSafeAreaView>
  );
};
