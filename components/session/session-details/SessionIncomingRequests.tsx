import React from "react";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LegendList } from "@legendapp/list";
import { View } from "react-native";
import { ResponseRequestDto } from "@/types";
import { Loader } from "@/components/shared/Loader";
import { toTimeOnly } from "@/lib/date";
import { ResponseSessionDto } from "@/types/session";
import { Icon } from "@/components/ui/icon";
import { Clock3, MapPin, MessageSquare, Users } from "lucide-react-native";
import StableScrollView from "@/components/shared/StableScrollView";
import { useInfiniteIncomingSessionRequests } from "@/hooks/content/sessions/useInfiniteIncomingSessionRequests";

interface SessionIncomingRequestsProps {
  className?: string;
  session: ResponseSessionDto;
}

export const SessionIncomingRequests = ({
  className,
  session,
}: SessionIncomingRequestsProps) => {
  const {
    incomingRequests,
    fetchNextPage,
    isIncomingRequestsPending,
    refetchIncomingRequests,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteIncomingSessionRequests({
    sessionId: session.id,
  });

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseRequestDto }) => {
      return (
        <View className="mx-4 my-2 bg-card border border-border rounded-lg overflow-hidden ">
          <View className="px-4 py-4">
            <View className="flex-row items-center justify-between mb-3">
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
                <Text className="text-sm">Request #{item.id}</Text>
              </Badge>

              <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
                <View className="flex-row items-center gap-1">
                  <Icon
                    as={Users}
                    size={12}
                    className="text-muted-foreground"
                  />
                  <Text className="text-sm">
                    {item.receivers?.length} receiver(s)
                  </Text>
                </View>
              </Badge>
            </View>
            <View className="flex-row items-center justify-start gap-2 mb-2.5">
              <Icon as={MessageSquare} size={15} />
              <Text className="text-base font-semibold">Message:</Text>
            </View>
            <View className="bg-muted/35 rounded-xl px-3 py-2.5 border border-border/60">
              <Text
                className="text-sm text-muted-foreground leading-5"
                numberOfLines={3}
              >
                {item.message || "No message attached to this request."}
              </Text>
            </View>

            <Separator className="my-3" />

            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-row items-center gap-1.5">
                <Icon as={MapPin} size={13} className="text-muted-foreground" />
                <Text className="text-xs text-muted-foreground">Location</Text>
              </View>
              <Text className="text-xs font-semibold">
                {item.location || "No location provided"}
              </Text>
            </View>

            <View className="flex-row items-center justify-between gap-2 mt-1.5">
              <View className="flex-row items-center gap-1.5">
                <Icon as={Clock3} size={13} className="text-muted-foreground" />
                <Text className="text-xs text-muted-foreground">Time</Text>
              </View>
              <Text className="text-xs font-semibold">
                {item.time ? toTimeOnly(new Date(item.time)) : "Not scheduled"}
              </Text>
            </View>

            <View className="flex-row items-center justify-between gap-2 mt-1.5">
              <Text className="text-xs text-muted-foreground">
                Session Owner
              </Text>
              <Text className="text-xs font-semibold">
                #{item.session.userId}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [],
  );

  if (isIncomingRequestsPending) {
    return (
      <View
        className={cn(
          "flex-1 bg-background items-center justify-center px-6",
          className,
        )}
      >
        <Loader />
      </View>
    );
  }

  return (
    <View className={cn("flex-1 bg-background", className)}>
      {incomingRequests?.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-muted-foreground text-center px-6">
            No requests were found for this session yet.
          </Text>
        </View>
      ) : (
        <StableScrollView
          className="flex-1"
          contentContainerClassName="pb-6"
          showsVerticalScrollIndicator={false}
        >
          {isIncomingRequestsPending ? (
            <View className="flex flex-col flex-1 justify-center items-center">
              <Loader />
            </View>
          ) : incomingRequests.length !== 0 ? (
            <View className="flex-1 bg-transparent mt-2">
              <LegendList
                className="flex-1"
                data={incomingRequests}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                recycleItems={true}
                onEndReached={() => {
                  if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                  }
                }}
                onRefresh={refetchIncomingRequests}
                onEndReachedThreshold={0.5}
                contentContainerStyle={{
                  paddingHorizontal: 0,
                }}
              />
            </View>
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-muted-foreground text-center px-6">
                No requests were found for this session yet.
              </Text>
            </View>
          )}
        </StableScrollView>
      )}
    </View>
  );
};
