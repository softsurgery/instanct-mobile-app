import React from "react";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { LegendList } from "@legendapp/list";
import { View } from "react-native";
import { ResponseRequestDto } from "@/types";
import { Loader } from "@/components/shared/Loader";
import { ResponseSessionDto } from "@/types/session";
import { useInfiniteSessionRequests } from "@/hooks/content/sessions/useInfiniteSessionRequests";
import { RefreshControl } from "react-native-gesture-handler";
import { SessionRequestCard } from "./SessionRequestCard";

interface SessionOutgoingRequestsProps {
  className?: string;
  session: ResponseSessionDto;
}

export const SessionOutgoingRequests = ({
  className,
  session,
}: SessionOutgoingRequestsProps) => {
  const {
    requests,
    fetchNextPage,
    isRequestsPending,
    refetchRequests,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSessionRequests({
    sessionId: session.id,
    join: ["session", "session.user", "receivers"],
  });

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseRequestDto }) => {
      return <SessionRequestCard request={item} />;
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
      {requests?.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-muted-foreground text-center px-6">
            No requests were found for this session yet.
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          {isRequestsPending ? (
            <View className="flex flex-col flex-1 justify-center items-center">
              <Loader />
            </View>
          ) : requests.length !== 0 ? (
            <View className="flex-1 bg-transparent mt-2">
              <LegendList
                className="flex-1"
                data={requests} // Remove the last item which is the placeholder for loading more
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
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
