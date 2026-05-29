import React from "react";
import { cn } from "@/lib/utils";
import { LegendList } from "@legendapp/list";
import { RefreshControl, View } from "react-native";
import { ResponseRequestDto } from "@/types";
import { Loader } from "@/components/shared/Loader";
import { useInfiniteIncomingSessionRequests } from "@/hooks/content/sessions/useInfiniteIncomingSessionRequests";
import { SessionRequestCard } from "../session/session-details/SessionRequestCard";
import { NotFound } from "../shared/NotFound";

interface SessionIncomingRequestsProps {
  className?: string;
}

export const SessionIncomingRequests = ({
  className,
}: SessionIncomingRequestsProps) => {
  const {
    incomingRequests: requests,
    fetchNextPage,
    isIncomingRequestsPending: isRequestsPending,
    refetchIncomingRequests: refetchRequests,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteIncomingSessionRequests({
    join: ["session", "session.user", "receivers"],
  });

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseRequestDto }) => {
      return <SessionRequestCard request={item} isIncoming={true} />;
    },
    [],
  );

  return (
    <View className={cn("flex-1 bg-background", className)}>
      <View className="flex-1">
        {isRequestsPending ? (
          <View className="flex flex-col flex-1 justify-center items-center">
            <Loader />
          </View>
        ) : (
          <View className="flex-1">
            <LegendList
              style={{ flex: 1 }}
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
                <View className="flex flex-col flex-1 justify-center items-center h-full">
                  <NotFound message="No incoming requests were found" />
                </View>
              )}
            />
          </View>
        )}
      </View>
    </View>
  );
};
