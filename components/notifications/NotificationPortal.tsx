import { LegendList } from "@legendapp/list";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";
import { api } from "~/api";
import { cn } from "~/lib/utils";
import { ResponseNotificationDto } from "~/types/notifications";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { Text } from "../ui/text";
import { NotificationEntry } from "./NotificationEntry";
import { NotificationEntrySkeleton } from "./NotificationEntrySkeleton";
import { useNotificationContext } from "@/contexts/NotificationsContext";

import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
interface NotificationPortalProps {
  className?: string;
}

export const NotificationsPortal = ({ className }: NotificationPortalProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");
  const { resetCount } = useNotificationContext();
  const [highlightedIds, setHighlightedIds] = React.useState<Set<string>>(
    new Set(),
  );
  const hasMarkedRead = React.useRef(false);
  const snapshotTaken = React.useRef(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isPending: isNotificationsPending,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.notifications.findPaginatedUserConversations({
        page: String(pageParam),
        limit: "20",
        sort: "createdAt,desc",
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });

  const notifications = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  React.useEffect(() => {
    if (snapshotTaken.current || !notifications.length) return;

    snapshotTaken.current = true;
    setHighlightedIds(
      new Set(
        notifications
          .filter((notification) => !notification.readAt)
          .map((notification) => String(notification.id)),
      ),
    );
  }, [notifications]);

  React.useEffect(() => {
    if (hasMarkedRead.current) return;
    if (isNotificationsPending) return;
    if (!snapshotTaken.current && notifications.length > 0) return;

    hasMarkedRead.current = true;
    resetCount();
  }, [isNotificationsPending, notifications.length, resetCount]);

  const isPending = isNotificationsPending || isFetchingNextPage;

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseNotificationDto }) => {
      return (
        <NotificationEntry
          className="px-4 mt-1"
          key={item.id}
          notification={item}
          isUnread={highlightedIds.has(String(item.id))}
        />
      );
    },
    [highlightedIds],
  );
  return (
    <StableSafeAreaView className={cn("flex flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.notifications")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <View className="flex-1 bg-background">
        <LegendList
          style={{ flex: 1 }}
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          recycleItems={true}
          maintainVisibleContentPosition
          onRefresh={async () => {
            await queryClient.invalidateQueries({
              queryKey: ["notifications"],
            });
          }}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            !isPending ? (
              <View className="p-6 items-center">
                <Text className="text-muted-foreground">
                  No Notification available
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            <View className="items-center mb-8 px-4">
              {isPending ? (
                <>
                  <NotificationEntrySkeleton />
                  <NotificationEntrySkeleton />
                  <NotificationEntrySkeleton />
                </>
              ) : hasNextPage ? null : (
                <View className="flex flex-row items-center justify-center gap-2 py-6">
                  <Text variant={"p"} className="text-muted-foreground">
                    You have caught up with all notifications
                  </Text>
                </View>
              )}
            </View>
          }
        />
      </View>
    </StableSafeAreaView>
  );
};
