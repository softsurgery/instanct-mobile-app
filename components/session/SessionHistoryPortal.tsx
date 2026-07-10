import React from "react";
import { View } from "react-native";
import { LegendList } from "@legendapp/list";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { cn } from "@/lib/utils";
import { ApplicationHeader } from "../shared/AppHeader";
import { Map as MapIcon, ChevronRight, Calendar } from "lucide-react-native";
import { router } from "expo-router";
import { Text } from "../ui/text";
import {
  SessionStatus,
  SessionType,
  type ResponseSessionDto,
} from "@/types/session";
import { toDateOnly, toTimeOnly } from "@/lib/date";
import { Icon } from "../ui/icon";
import { useInfiniteUserSessions } from "@/hooks/content/sessions/useInfiniteUserSessions";
import { StablePressable } from "../shared/StablePressable";
import { SessionStarter } from "./SessionStarter";
import { useTranslation } from "react-i18next";
import { Loader } from "../shared/Loader";
import { SessionStatusLegend } from "./SessionStatusLegend";

import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
interface SessionHistoryPortalProps {
  className?: string;
}

export const SessionHistoryPortal = ({
  className,
}: SessionHistoryPortalProps) => {
  const { t } = useTranslation("common");

  const {
    sessions,
    fetchNextPage,
    isSessionsPending,
    refetchSessions,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUserSessions({
    sessionType: SessionType.MAP_SESSION,
  });

  const formatSessionName = (
    startDate: Date | undefined,
    endDate: Date | undefined,
  ) => {
    const start = startDate ? toDateOnly(new Date(startDate)) : "N/A";
    const end = endDate ? toDateOnly(new Date(endDate)) : "N/A";

    const isSameDay = start === end;

    if (isSameDay) return `${start}`;
    return `${start} → ${end}`;
  };

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseSessionDto }) => (
      <StablePressable
        className={cn(
          "p-4 my-1 rounded-lg",
          item.status === SessionStatus.ACTIVE &&
            "bg-green-500/10 active:bg-green-500/25",
          item.status === SessionStatus.SCHEDULED &&
            "bg-primary/10 active:bg-primary/25",
          item.status === SessionStatus.CANCELLED &&
            "bg-destructive/10 active:bg-destructive/25",
        )}
        onPress={() =>
          router.push({
            pathname: "/main/sessions/details",
            params: {
              session: JSON.stringify(item),
            },
          })
        }
      >
        <View className="flex flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <View className="bg-primary/10 h-10 w-10 items-center justify-center rounded-full">
              {item.sessionType.includes("Map") ? (
                <Icon as={MapIcon} size={20} />
              ) : (
                <Icon as={Calendar} size={20} />
              )}
            </View>
            <View className="flex-col pb-0.5">
              <Text className="font-semibold text-foreground text-base">
                {formatSessionName(item.plannedStart, item.plannedEnd)}
              </Text>
              <Text className="text-sm text-muted-foreground mt-0.5">
                {item.plannedStart
                  ? toTimeOnly(new Date(item.plannedStart))
                  : "N/A"}
                {" → "}
                {item.plannedEnd
                  ? toTimeOnly(new Date(item.plannedEnd))
                  : "N/A"}
              </Text>
            </View>
          </View>
          <Icon as={ChevronRight} size={20} />
        </View>
      </StablePressable>
    ),
    [],
  );

  return (
    <StableSafeAreaView
      className={cn("flex flex-1 flex-col bg-card", className)}
    >
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        titleVariant="large"
        title={t("screens.sessions")}
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <View className="flex-1">
        {isSessionsPending ? (
          <View className="flex flex-col flex-1 justify-center items-center">
            <Loader />
          </View>
        ) : sessions.length !== 0 ? (
          <View className="flex-1 bg-background">
            <SessionStatusLegend />
            <LegendList
              className="flex-1"
              data={sessions}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              recycleItems={true}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onRefresh={refetchSessions}
              onEndReachedThreshold={0.5}
              contentContainerStyle={{
                paddingHorizontal: 0,
              }}
            />
          </View>
        ) : (
          <SessionStarter className="px-4" />
        )}
      </View>
    </StableSafeAreaView>
  );
};
