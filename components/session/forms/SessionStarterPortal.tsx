import { cn } from "@/lib/utils";
import { View } from "react-native";
import { StableSafeAreaView } from "../../shared/StableSafeAreaView";
import { ApplicationHeader } from "../../shared/AppHeader";
import { Info } from "lucide-react-native";
import { router } from "expo-router";
import { StableKeyboardAwareScrollView } from "../../shared/StableKeyboardAwareScrollView";
import { FormBuilder } from "../../shared/form-builder/FormBuilder";
import { Button } from "../../ui/button";
import { Text } from "../../ui/text";
import { useSessionStarterFormStructure } from "./useSessionStarterFormStructure";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { useSessionStore } from "@/stores/useSessionStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import React from "react";
import { createSessionSchema } from "@/types/validations/session.validation";
import { ServerErrorResponse } from "@/types";
import { SessionType } from "@/types/session";
import { useUserSessions } from "@/hooks/content/sessions/useUserSessions";
import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { mapToSelectOptions } from "../../shared/form-builder/utils/map-select-options";
import { zodErrorsToNested } from "@/lib/object";
import { toast } from "sonner-native";
import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
import { useTranslation } from "react-i18next";
import { BottomButtonWrapper } from "@/components/shared/BottomButtonBlockWrapper";
interface SessionStarterPortalProps {
  className?: string;
}

export const SessionStarterPortal = ({
  className,
}: SessionStarterPortalProps) => {
  const { t } = useTranslation("explore");
  const queryClient = useQueryClient();
  const isKeyboardVisible = useKeyboardVisible();
  const sessionStore = useSessionStore();

  const { mutate: startSession, isPending: isStartingSessionPending } =
    useMutation({
      mutationFn: async () => api.session.start(sessionStore.createDto),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["active-sessions"],
        });
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
        toast.success(t("session.start.toasts.success.title"), {
          description: t("session.start.toasts.success.description"),
        });
        router.replace(`/main/(tabs)`);
        sessionStore.reset();
      },
      onError: (error: ServerErrorResponse) => {
        toast.error(t("session.start.toasts.error.title"), {
          description:
            error.message || t("session.start.toasts.error.description"),
        });
      },
    });

  const { objectives, isObjectivesSubTypePending } = useObjectives();

  // Prefill the form with the objectives of the most recent session.
  const { sessions: lastSessions, isSessionsPending: isLastSessionPending } =
    useUserSessions({
      page: "1",
      limit: "1",
      sessionType: SessionType.MAP_SESSION,
      sort: "createdAt,desc",
    });

  React.useEffect(() => {
    const lastObjectives = lastSessions[0]?.payload?.objectives as
      | number[]
      | undefined;
    if (lastObjectives?.length)
      sessionStore.setNested("createDto.payload.objectives", lastObjectives);
  }, [lastSessions]);

  const { structure } = useSessionStarterFormStructure({
    store: sessionStore,
    objectives: mapToSelectOptions({
      data: objectives,
      labelKey: "label",
      valueKey: "id",
    }),
    isPending:
      isStartingSessionPending ||
      isObjectivesSubTypePending ||
      isLastSessionPending,
  });

  const isEndDateNextDay = React.useMemo(() => {
    const { plannedStart, plannedEnd } = sessionStore.createDto;
    if (!plannedStart || !plannedEnd) return false;
    return new Date(plannedEnd) < new Date(plannedStart);
  }, [sessionStore.createDto]);

  const isSubmitDisabled =
    isStartingSessionPending ||
    isObjectivesSubTypePending ||
    isLastSessionPending;

  const handleSessionStart = () => {
    const result = createSessionSchema(sessionStore.flags.startNow).safeParse(
      sessionStore.createDto,
    );
    if (!result.success) {
      sessionStore.set("errors", zodErrorsToNested(result.error));
      return;
    }
    startSession();
  };

  React.useEffect(() => {
    return () => {
      sessionStore.reset();
    };
  }, []);

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("session.start.title")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <StableKeyboardAwareScrollView className="flex-1 bg-background">
        <View className="p-4">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            {t("session.start.description")}
          </Text>
        </View>
        <FormBuilder structure={structure} className="px-2" />
        {isEndDateNextDay && (
          <View className="mx-4 mt-4 flex-row items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <Info size={18} className="mt-0.5 text-amber-600" />
            <Text className="flex-1 text-sm leading-relaxed text-foreground">
              {t("session.start.nextDayWarning")}
            </Text>
          </View>
        )}
      </StableKeyboardAwareScrollView>
      {!isKeyboardVisible && (
        <BottomButtonWrapper>
          <Button
            size="lg"
            variant="default"
            className="rounded-xl"
            onPress={handleSessionStart}
            disabled={isSubmitDisabled}
          >
            <Text className="text-md font-bold">
              {isStartingSessionPending
                ? t("session.start.actions.startSessionPending")
                : t("session.start.actions.startSession")}
            </Text>
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
