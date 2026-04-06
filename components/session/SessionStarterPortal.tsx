import { cn } from "@/lib/utils";
import { Alert, View } from "react-native";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { ApplicationHeader } from "../shared/AppHeader";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { StableKeyboardAwareScrollView } from "../shared/StableKeyboardAwareScrollView";
import { FormBuilder } from "../shared/form-builder/FormBuilder";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { useSessionStarterFormStructure } from "./useSessionStarterFormStructure";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { useSessionStore } from "@/stores/useSessionStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import React from "react";
import { createSessionSchema } from "@/types/validations/session.validation";
import { ServerErrorResponse } from "@/types";
import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { mapToSelectOptions } from "../shared/form-builder/utils/map-select-options";
import { zodErrorsToNested } from "@/lib/object";
import { toast } from "sonner-native";

interface SessionStarterPortalProps {
  className?: string;
}

export const SessionStarterPortal = ({
  className,
}: SessionStarterPortalProps) => {
  const queryClient = useQueryClient();
  const isKeyboardVisible = useKeyboardVisible();
  const sessionStore = useSessionStore();

  // session start mutation
  const { mutate: startSession, isPending: isStartingSessionPending } =
    useMutation({
      mutationFn: async () => api.session.start(sessionStore.createDto),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
        toast.success("Session started successfully!", {
          description: "Your session has been successfully started.",
        });
        router.replace(`/main/(tabs)`);
        sessionStore.reset();
      },
      onError: (error: ServerErrorResponse) => {
        Alert.alert("Error", JSON.stringify(error.message, null, 2));
      },
    });

  const { objectives, isObjectivesPending } = useObjectives();

  const { structure } = useSessionStarterFormStructure({
    store: sessionStore,
    objectives: mapToSelectOptions({
      data: objectives,
      labelKey: "label",
      valueKey: "id",
    }),
    isPending: isStartingSessionPending || isObjectivesPending,
  });

  const isEndDateNextDay = React.useMemo(() => {
    const { plannedStart, plannedEnd } = sessionStore.createDto;

    if (!plannedStart || !plannedEnd) return false;

    const start = new Date(plannedStart);
    const end = new Date(plannedEnd);

    return end < start;
  }, [sessionStore.createDto]);

  const handleSessionStart = () => {
    const result = createSessionSchema.safeParse(sessionStore.createDto);
    if (!result.success) {
      sessionStore.set("createDtoErrors", zodErrorsToNested(result.error));
    } else {
      startSession();
    }
  };

  React.useEffect(() => {
    return () => {
      sessionStore.reset();
    };
  }, []);

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2"
        title={"Démarrer une session"}
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
            Veuillez fournir les détails de votre session. Ces informations
            aideront les autres à comprendre quand vous êtes disponible et
            intéressé par la connexion.
          </Text>
        </View>
        <FormBuilder structure={structure} className="px-2" />
        {isEndDateNextDay && sessionStore.createDto && (
          <View className="mx-4 mt-4 p-4 rounded-lg bg-destructive/25">
            <Text className="text-sm">
              Votre session se terminera le jour suivant car l&apos;heure de fin
              est antérieure à l&apos;heure de début.
            </Text>
          </View>
        )}
      </StableKeyboardAwareScrollView>
      {!isKeyboardVisible && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-card p-8 pt-4">
          <Button
            size="sm"
            className="rounded-full"
            onPress={() => handleSessionStart()}
            disabled={isStartingSessionPending}
          >
            <Text>Sélectionner la session</Text>
          </Button>
        </View>
      )}
    </StableSafeAreaView>
  );
};
