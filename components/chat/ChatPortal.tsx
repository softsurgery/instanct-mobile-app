import React from "react";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useDebounce } from "@/hooks/useDebounce";
import { LegendList } from "@legendapp/list";
import { format } from "date-fns";
import { router } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";
import { cn } from "~/lib/utils";
import { ResponseConversationDto } from "~/types";
import { ApplicationHeader } from "../shared/AppHeader";
import { StablePressable } from "../shared/StablePressable";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { Text } from "../ui/text";
import { UserEntry } from "./UserEntry";
import { MarkedInput } from "../shared/MarkedInput";
import { Separator } from "../ui/separator";
import { Loader } from "../shared/Loader";
import { NotFound } from "../shared/NotFound";
import { useMyConversations } from "@/hooks/content/chat/useMyConversations";

interface ChatPortalProps {
  className?: string;
}

export const ChatPortal = ({ className }: ChatPortalProps) => {
  const { t } = useTranslation("common");
  const [searchQuery, setSearchQuery] = React.useState("");
  const { value: debouncedSearchQuery } = useDebounce(searchQuery, 500);

  const { currentUser } = useCurrentUser();

  const {
    conversations,
    hasNextPage,
    isPending,
    isFetchingNextPage,
    isRefetching,
    fetchNextPage,
    refetch,
  } = useMyConversations({
    search: debouncedSearchQuery,
    join: ["participants", "participants.user", "lastMessage"].join(","),
    enabled: !!currentUser,
  });

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseConversationDto }) => {
      const user = item.participants.find((p) => p.userId !== currentUser?.id);

      if (!user) return null;
      return (
        <StablePressable
          key={item.id}
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
            user={user.user}
            lastMessage={item.lastMessage ? item.lastMessage.content : ""}
            sentAt={
              item.lastMessage
                ? format(item.lastMessage.createdAt, "dd/MM/yy hh:mm a")
                : ""
            }
          />
        </StablePressable>
      );
    },
    [currentUser?.id],
  );

  return (
    <StableSafeAreaView
      className={cn("flex flex-1 flex-col bg-card", className)}
    >
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
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
        <MarkedInput
          icon={Search}
          placeholder={t("Search conversations...")}
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="m-4"
        />
        <Separator />
        {/* Manual Tabs */}
        {isPending ? (
          <View className="flex flex-col flex-1 justify-center items-center px-4">
            <Loader />
          </View>
        ) : conversations.length === 0 ? (
          <View className="flex flex-col flex-1 justify-center items-center px-4">
            <NotFound />
            <Text variant={"large"} className="text-center">
              No conversations found. Start a new chat by searching for a user.
            </Text>
          </View>
        ) : (
          <View className="flex-1 px-2">
            <LegendList
              style={{ flex: 1, paddingVertical: 4 }}
              data={conversations}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              recycleItems={true}
              maintainVisibleContentPosition
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
        )}
      </View>
    </StableSafeAreaView>
  );
};
