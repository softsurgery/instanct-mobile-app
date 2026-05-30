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
import { Text } from "../ui/text";
import { format, isToday, isYesterday, parseISO } from "date-fns";

interface SessionOutgoingRequestsProps {
  className?: string;
  handleScroll?: (event: any) => void;
}

type GroupedRequests = {
  title: string;
  data: ResponseRequestDto[];
};

export const SessionOutgoingRequests = ({
  className,
  handleScroll,
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

  const groupedRequests = React.useMemo<GroupedRequests[]>(() => {
    const grouped: Record<string, ResponseRequestDto[]> = {};

    requests.forEach((request) => {
      const date = parseISO(new Date(request.createdAt).toISOString());

      let title = format(date, "MMMM d, yyyy");

      if (isToday(date)) {
        title = "Today";
      } else if (isYesterday(date)) {
        title = "Yesterday";
      }

      if (!grouped[title]) {
        grouped[title] = [];
      }

      grouped[title].push(request);
    });

    return Object.entries(grouped).map(([title, data]) => ({
      title,
      data,
    }));
  }, [requests]);

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
      <View className="flex-1">
        <LegendList
          style={{ flex: 1, paddingBlock: 12 }}
          className="flex-1"
          data={groupedRequests}
          onScroll={handleScroll}
          renderItem={({ item }) => (
            <View className="mb-4">
              <Text className="mb-2.5 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {item.title}
              </Text>
              {item.data.map((request) => (
                <SessionRequestCard
                  key={request.id}
                  className="mx-4 mb-3"
                  request={request}
                  isIncoming={false}
                />
              ))}
            </View>
          )}
          keyExtractor={(item) => item.title}
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
            paddingBottom: 24,
          }}
          ListEmptyComponent={() => (
            <View className="flex flex-col flex-1 justify-center items-center">
              <NotFound message="No outgoing requests were found" />
            </View>
          )}
        />
      </View>
    </View>
  );
};
