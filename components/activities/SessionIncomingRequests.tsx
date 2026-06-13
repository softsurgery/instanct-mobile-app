import React from "react";
import { cn } from "@/lib/utils";
import { LegendList } from "@legendapp/list";
import { RefreshControl, View } from "react-native";
import { ResponseRequestDto } from "@/types";
import { Loader } from "@/components/shared/Loader";
import { useInfiniteIncomingSessionRequests } from "@/hooks/content/sessions/useInfiniteIncomingSessionRequests";
import { SessionRequestCard } from "../session/session-details/SessionRequestCard";
import { NotFound } from "../shared/NotFound";
import { Text } from "../ui/text";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { SessionRequestCardSkeleton } from "./skeletons/SessionRequestCardSkeleton";

interface SessionIncomingRequestsProps {
  className?: string;
  handleScroll?: (event: any) => void;
}

type FlattenedItem =
  | { type: "header"; title: string; id: string }
  | { type: "item"; request: ResponseRequestDto; id: string };

export const SessionIncomingRequests = ({
  className,
  handleScroll,
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

  const renderItem = React.useCallback(({ item }: { item: FlattenedItem }) => {
    if (item.type === "header") {
      return (
        <Text className="mb-2.5 mt-2 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {item.title}
        </Text>
      );
    }

    return (
      <SessionRequestCard
        className="mx-4 mb-3"
        request={item.request}
        isIncoming={true}
      />
    );
  }, []);

  const flattenedData = React.useMemo<FlattenedItem[]>(() => {
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

    const flattened: FlattenedItem[] = [];
    Object.entries(grouped).forEach(([title, data]) => {
      flattened.push({ type: "header", title, id: `header-${title}` });
      data.forEach((request) => {
        flattened.push({
          type: "item",
          request,
          id: `item-${request.id}`,
        });
      });
    });

    return flattened;
  }, [requests]);

  return (
    <View className={cn("flex-1 bg-background", className)}>
      <View className="flex-1">
        {isRequestsPending ? (
          <SessionRequestCardSkeleton count={3} />
        ) : (
          <View className="flex-1">
            <LegendList
              style={{ flex: 1, paddingBlock: 12 }}
              data={flattenedData}
              onScroll={handleScroll}
              renderItem={renderItem}
              recycleItems={true}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
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
                flexGrow: 1,
              }}
              ListEmptyComponent={() => (
                <View className="flex flex-col flex-1 justify-center items-center">
                  <NotFound message="No incoming requests were found" />
                </View>
              )}
              ListFooterComponent={
                <View className="items-center mb-8">
                  {isFetchingNextPage ? (
                    <Loader size="small" className="flex items-center h-fit" />
                  ) : !hasNextPage && flattenedData.length > 0 ? (
                    <View className="flex flex-row items-center justify-center gap-2 p-6">
                      <Text variant="p" className="text-muted-foreground">
                        You have caught up with all incoming requests
                      </Text>
                    </View>
                  ) : null}
                </View>
              }
            />
          </View>
        )}
      </View>
    </View>
  );
};
