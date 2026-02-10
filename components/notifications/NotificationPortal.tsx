import { LegendList } from "@legendapp/list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import { api } from "~/api";
import { cn } from "~/lib/utils";
import { ResponseNotificationDto } from "~/types/notifications";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { Text } from "../ui/text";
import { NotificationEntry } from "./NotificationEntry";

interface NotificationPortalProps {
  className?: string;
}

export const NotificationsPortal = ({ className }: NotificationPortalProps) => {
  const { t } = useTranslation("common");
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
        limit: "5",
        sort: "createdAt,desc",
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });

  const notifications = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const isPending = isNotificationsPending || isFetchingNextPage;

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseNotificationDto }) => {
      return (
        <NotificationEntry className="" key={item.id} notification={item} />
      );
    },
    [],
  );
  return (
    <StableSafeAreaView className={cn("flex flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={t("screens.notifications")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => {
              router.back();
            },
          },
        ]}
      />
      <View className="flex-1 bg-background">
        <LegendList
          className={cn("flex-1 py-4")}
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          recycleItems={true}
          maintainVisibleContentPosition
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="transparent"
              colors={["transparent"]}
            />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            isNotificationsPending || isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                className="flex items-center h-fit"
              />
            ) : null
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
            <View className="items-center">
              {isPending ? (
                <ActivityIndicator
                  size="small"
                  className="flex items-center h-fit"
                />
              ) : hasNextPage ? null : (
                <View className="flex flex-row items-center justify-center gap-2 p-6">
                  <Text variant={"p"} className="text-muted-foreground">
                    You have catched up with all notifications
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
