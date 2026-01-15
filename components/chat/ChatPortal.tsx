import { useNotificationContext } from "@/contexts/NotificationsContext";
import { useConversationMessages } from "@/hooks/content/useConversationMessages";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useDebounce } from "@/hooks/useDebounce";
import { LegendList } from "@legendapp/list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import { api } from "~/api";
import { cn } from "~/lib/utils";
import { ResponseConversationDto } from "~/types";
import { ApplicationHeader } from "../shared/AppHeader";
import { StablePressable } from "../shared/StablePressable";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { Separator } from "../ui/separator";
import { Text } from "../ui/text";
import { UserEntry } from "./UserEntry";

interface ChatPortalProps {
  className?: string;
}

export const ChatPortal = ({ className }: ChatPortalProps) => {
  const { t } = useTranslation("common");
  const { newCount, resetCount } = useNotificationContext();

  const { currentUser } = useCurrentUser();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isPending: isConversationsPending,
  } = useInfiniteQuery({
    queryKey: ["conversations"],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.chat.conversation.findPaginatedUserConversations({
        page: String(pageParam),
        limit: "5",
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });

  const conversations = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const isPending = isConversationsPending || isFetchingNextPage;

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseConversationDto }) => {
      const { messages } = useConversationMessages({
        id: item.id,
        query: {
          limit: "1",
          sort: "createdAt,desc",
        },
      });

      return (
        <StablePressable
          key={new Date().getTime()}
          className="flex flex-col gap-4 py-2"
          onPress={() =>
            router.navigate({
              pathname: "/main/chat/conversation",
              params: { id: item.id },
            })
          }
        >
          <UserEntry
            user={
              item.participants.find((user) => user.id !== currentUser?.id)!
            }
            lastMessage={messages?.length > 0 ? messages[0].content : ""}
            sentAt={
              messages.length > 0
                ? format(messages[0].createdAt, "hh:mm a")
                : ""
            }
          />
        </StablePressable>
      );
    },
    []
  );

  const [dragging, setDragging] = React.useState(false);
  const { value: debouncedDragging, loading: isDragging } = useDebounce(
    dragging,
    1000
  );

  return (
    <StableSafeAreaView className={cn("flex flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={t("screens.chat")}
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
        {/* Manual Tabs */}

        <View className="flex-1">
          <LegendList
            className={cn("flex-1")}
            data={conversations}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            recycleItems={true}
            maintainVisibleContentPosition
            onScrollBeginDrag={() => setDragging(true)}
            onScrollEndDrag={() => setDragging(false)}
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
              isRefetching || debouncedDragging || isDragging ? (
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
                    No conversations available
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              <View className="items-center">
                {isPending ? (
                  <ActivityIndicator />
                ) : hasNextPage ? null : (
                  <View className="flex flex-row items-center justify-center gap-2 p-6">
                    <Text className="text-muted-foreground text-lg font-thin">
                      No more conversations
                    </Text>
                  </View>
                )}
              </View>
            }
          />
        </View>
      </View>
    </StableSafeAreaView>
  );
};
