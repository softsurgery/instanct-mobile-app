import React from "react";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useDebounce } from "@/hooks/useDebounce";
import { LegendList } from "@legendapp/list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { router } from "expo-router";
import { ArrowLeft, Search, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";
import { api } from "~/api";
import { cn } from "~/lib/utils";
import { ResponseConversationDto } from "~/types";
import { ApplicationHeader } from "../shared/AppHeader";
import { StablePressable } from "../shared/StablePressable";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { Input } from "../ui/input";
import { Text } from "../ui/text";
import { UserEntry } from "./UserEntry";
import { Icon } from "../ui/icon";

interface ChatPortalProps {
  className?: string;
}

export const ChatPortal = ({ className }: ChatPortalProps) => {
  const { t } = useTranslation("common");
  const [searchQuery, setSearchQuery] = React.useState("");
  const { value: debouncedSearchQuery } = useDebounce(searchQuery, 500);

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
    queryKey: ["conversations", debouncedSearchQuery],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      api.chat.conversation.findPaginatedUserConversations({
        page: String(pageParam),
        limit: "5",
        search: debouncedSearchQuery,
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
      const user = item.participants.find(
        (user) => user.id !== currentUser?.id,
      );
      if (!user) return null;
      return (
        <StablePressable
          key={new Date().getTime()}
          className="flex flex-col gap-4"
          onPress={() =>
            router.navigate({
              pathname: "/main/chat/conversation",
              params: { id: item.id },
            })
          }
        >
          <UserEntry
            className="py-2"
            user={user}
            lastMessage={
              item.messages?.length > 0 ? item.messages[0].content : ""
            }
            sentAt={
              item.messages?.length > 0
                ? format(item.messages[0].createdAt, "hh:mm a")
                : ""
            }
          />
        </StablePressable>
      );
    },
    [currentUser?.id],
  );

  const [dragging, setDragging] = React.useState(false);
  const { value: debouncedDragging, loading: isDragging } = useDebounce(
    dragging,
    1000,
  );

  return (
    <StableSafeAreaView
      className={cn("flex flex-1 flex-col bg-card", className)}
    >
      <ApplicationHeader
        className="border-b border-border pb-2"
        title={t("screens.messages")}
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
        {/* Search Bar */}
        <View className="flex flex-row items-center gap-2 border-b border-border px-3 py-4">
          <Icon as={Search} size={18} className="text-muted-foreground" />
          <Input
            placeholder={"Search conversations..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 border-0 bg-transparent placeholder:text-muted-foreground py-0 h-9"
            placeholderTextColor="rgba(109, 114, 120, 0.7)"
          />
          {searchQuery !== "" && (
            <StablePressable onPress={() => setSearchQuery("")}>
              <Icon as={X} size={18} className="text-muted-foreground" />
            </StablePressable>
          )}
        </View>
        {/* Manual Tabs */}

        <View className="flex-1 px-3">
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
                progressViewOffset={0}
                enabled={true}
              />
            }
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              !isPending ? (
                <View className="p-6 items-center">
                  <Text className="text-muted-foreground">
                    No conversations available
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      </View>
    </StableSafeAreaView>
  );
};
