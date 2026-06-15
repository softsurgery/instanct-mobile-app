import React from "react";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useDebounce } from "@/hooks/useDebounce";
import { LegendList } from "@legendapp/list";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, RefreshControl, View } from "react-native";
import { cn } from "~/lib/utils";
import { ResponseConversationDto } from "~/types";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { UserEntry } from "./UserEntry";
import { MarkedInput } from "../shared/MarkedInput";
import { Separator } from "../ui/separator";
import { NotFound } from "../shared/NotFound";
import { useChat } from "@/hooks/content/chat/useChat";
import { UserEntrySkeleton } from "./UserEntrySkeleton";

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
    seeConversation,
  } = useChat({
    search: debouncedSearchQuery,
    join: ["participants", "participants.user", "lastMessage"].join(","),
    enabled: !!currentUser,
  });

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseConversationDto }) => {
      const user = item.participants.find((p) => p.userId !== currentUser?.id);

      if (!user) return null;
      return (
        <Pressable
          className="flex flex-col gap-4 active:bg-muted"
          onPress={() => {
            router.push({
              pathname: "/main/chat/conversation",
              params: { id: item.id },
            });
            seeConversation(item.id);
          }}
        >
          <UserEntry className="py-2 px-5" conversation={item} />
        </Pressable>
      );
    },
    [currentUser?.id, seeConversation],
  );

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSearchQuery("");
      };
    }, []),
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
        <View className="flex-1">
          <LegendList
            style={{ flex: 1, paddingBlock: 12 }}
            data={conversations}
            renderItem={renderItem}
            recycleItems={true}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
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
            contentContainerStyle={{
              paddingHorizontal: 0,
              paddingBottom: 24,
              flexGrow: 1,
            }}
            ListEmptyComponent={
              !isPending ? (
                <View className="flex flex-col flex-1">
                  <NotFound
                    className="justify-center items-center"
                    message={[
                      "No conversations found.",
                      "Start a new chat by searching for a user.",
                    ]}
                  />
                </View>
              ) : null
            }
            ListFooterComponent={
              <View className="items-center mb-8 w-full">
                {isPending ? (
                  <>
                    <UserEntrySkeleton className="py-2" />
                    <UserEntrySkeleton className="py-2" />
                    <UserEntrySkeleton className="py-2" />
                    <UserEntrySkeleton className="py-2" />
                    <UserEntrySkeleton className="py-2" />
                    <UserEntrySkeleton className="py-2" />
                  </>
                ) : null}
              </View>
            }
          />
        </View>
      </View>
    </StableSafeAreaView>
  );
};
