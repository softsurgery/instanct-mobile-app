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
import { showToastable } from "react-native-toastable";
import React from "react";
import { createSessionSchema } from "@/types/validations/session.validation";
import { ServerErrorResponse } from "@/types";

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
        showToastable({
          message: "Session started successfully!",
        });
        router.replace(`/main/(tabs)`);
        sessionStore.reset();
      },
      onError: (error: ServerErrorResponse) => {
        Alert.alert("Error", JSON.stringify(error.message, null, 2));
      },
    });

  const { structure } = useSessionStarterFormStructure({
    store: sessionStore,
    isPending: isStartingSessionPending,
  });

  const isEndDateNextDay = React.useMemo(() => {
    const { plannedStart, plannedEnd } = sessionStore.createDto;

    if (!plannedStart || !plannedEnd) return false;

    const start = new Date(plannedStart);
    const end = new Date(plannedEnd);

    return end < start;
  }, [sessionStore.createDto.plannedStart, sessionStore.createDto.plannedEnd]);

  const handleSessionStart = () => {
    const result = createSessionSchema.safeParse(sessionStore.createDto);
    if (!result.success)
      sessionStore.set("createDtoErrors", result.error.flatten().fieldErrors);
    else startSession();
  };

  return (
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={"Start a Session"}
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
      <View className="flex-1 bg-background">
        <StableKeyboardAwareScrollView className="flex-1 bg-background ">
          <View className="p-4">
            <Text className="text-sm text-muted-foreground leading-relaxed">
              Please provide the details about your session. This information
              will help others understand when you are available and interested
              in connecting.
            </Text>
          </View>
          <FormBuilder structure={structure} className="px-2" />
          {isEndDateNextDay && sessionStore.createDto && (
            <View className="mx-4 mt-4 p-4 rounded-lg bg-destructive/25">
              <Text className="text-sm">
                Your session will end the next day since the end time is before
                the start time.
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
            >
              <Text>Start Session</Text>
            </Button>
          </View>
        )}
      </View>
    </StableSafeAreaView>
  );
};
