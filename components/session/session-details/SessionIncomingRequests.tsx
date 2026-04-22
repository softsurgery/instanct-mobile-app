import React from "react";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { LegendList } from "@legendapp/list";
import { View } from "react-native";
import { ResponseRequestDto } from "@/types";
import { Loader } from "@/components/shared/Loader";
import { ResponseSessionDto } from "@/types/session";
import { useInfiniteIncomingSessionRequests } from "@/hooks/content/sessions/useInfiniteIncomingSessionRequests";
import { SessionRequestCard } from "./SessionRequestCard";

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
    join: ["session", "session.user", "receivers"],
  });

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseRequestDto }) => {
      return <SessionRequestCard request={item} reverse={true} />;
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
        <View className="flex-1">
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
        </View>
      )}
    </View>
  );
};
