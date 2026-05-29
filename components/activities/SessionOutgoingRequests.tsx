import React from "react";
import { cn } from "@/lib/utils";
import { LegendList } from "@legendapp/list";
import { View } from "react-native";
import { ResponseRequestDto } from "@/types";
import { Loader } from "@/components/shared/Loader";
import { RefreshControl } from "react-native-gesture-handler";
import { SessionRequestCard } from "../session/session-details/SessionRequestCard";
import { useInfiniteOutgoingSessionRequests } from "@/hooks/content/sessions/useInfiniteOutgoingSessionRequests";
import { NotFound } from "../shared/NotFound";

interface SessionOutgoingRequestsProps {
  className?: string;
}

export const SessionOutgoingRequests = ({
  className,
}: SessionOutgoingRequestsProps) => {
  const {
    outgoingRequests: requests,
    fetchNextPage,
    isOutgoingRequestsPending: isRequestsPending,
    refetchOutgoingRequests: refetchRequests,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteOutgoingSessionRequests({
    join: ["session", "session.user", "receivers"],
  });

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseRequestDto }) => {
      return <SessionRequestCard request={item} isIncoming={false} />;
    },
    [],
  );

  if (isRequestsPending) {
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
      {isRequestsPending ? (
        <View className="flex flex-col flex-1 justify-center items-center">
          <Loader />
        </View>
      ) : (
        <View className="flex-1">
          <LegendList
            style={{ flex: 1 }}
            className="flex-1"
            data={requests}
            renderItem={renderItem}
            keyExtractor={(item) => item?.id?.toString()}
            showsVerticalScrollIndicator={false}
            recycleItems={true}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            refreshControl={
              <RefreshControl
                refreshing={isRequestsPending}
                onRefresh={refetchRequests}
              />
            }
            onEndReachedThreshold={0.5}
            contentContainerStyle={{
              paddingHorizontal: 0,
            }}
            ListEmptyComponent={() => (
              <View className="flex flex-col flex-1 justify-center items-center">
                <NotFound message="No outgoing requests were found" />
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};
