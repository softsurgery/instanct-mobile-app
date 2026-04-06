import React from "react";
import StableScrollView from "@/components/shared/StableScrollView";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { Text } from "@/components/ui/text";
import { toDateOnly } from "@/lib/date";
import { cn } from "@/lib/utils";
import { MapSessionPayload, ResponseSessionDto } from "@/types/session";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { View } from "react-native";
import { SessionDetailsContent } from "./SessionDetailsContent";

interface SessionDetailsPortalProps {
  className?: string;
}

export const SessionDetailsPortal = ({
  className,
}: SessionDetailsPortalProps) => {
  const { session: sessionParam } = useLocalSearchParams<{
    session?: string;
  }>();

  const getStatus = (session: ResponseSessionDto<MapSessionPayload>) => {
    if (session.ended) return "Ended";
    if (session.started) return "In Progress";
    return "Scheduled";
  };

  const formatSessionWindow = (
    session: ResponseSessionDto<MapSessionPayload>,
  ) => {
    const start = session.plannedStart
      ? toDateOnly(new Date(session.plannedStart))
      : "N/A";
    const end = session.plannedEnd
      ? toDateOnly(new Date(session.plannedEnd))
      : null;
    return end ? `${start} to ${end}` : start;
  };

  const session =
    React.useMemo<ResponseSessionDto<MapSessionPayload> | null>(() => {
      if (!sessionParam || typeof sessionParam !== "string") return null;
      try {
        return JSON.parse(
          sessionParam,
        ) as ResponseSessionDto<MapSessionPayload>;
      } catch {
        return null;
      }
    }, [sessionParam]);

  const EmptyState = () => (
    <View className="px-4 mt-4">
      <View className="rounded-2xl border border-destructive/60 bg-destructive/5 shadow-sm overflow-hidden">
        <View className="p-4">
          <Text className="text-lg font-semibold">Session not found</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            We could not load this session&apos;s details.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <StableSafeAreaView className={cn("flex-1 bg-background", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title="Session Details"
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

      <StableScrollView>
        {!session ? (
          <EmptyState />
        ) : (
          <SessionDetailsContent
            session={session}
            getStatus={getStatus}
            formatSessionWindow={formatSessionWindow}
          />
        )}
      </StableScrollView>
    </StableSafeAreaView>
  );
};
