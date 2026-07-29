import React from "react";
import type { MapSessionPayload, ResponseSessionDto } from "@/types/session";
import { View } from "react-native";
import { SessionIncomingRequests } from "./SessionIncomingRequests";
import { SessionOutgoingRequests } from "./SessionOutgoingRequests";
import { Text } from "../ui/text";
import { useInfiniteUserBookmarks } from "@/hooks/content/users/useInfinteUserBookmarks";
import { LegendList } from "@legendapp/list";
import { BookmarkCard } from "./BookmarkCard";
import { ResponseUserBookmarkDto } from "@/types/bookmark";
import { ResponseUserDto } from "@/types";
import { Loader } from "@/components/shared/Loader";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { NotFound } from "../shared/NotFound";
import { BookmarkSkeleton } from "./skeletons/BookmarkSkeleton";
import { createMaterialTopTabNavigator } from "expo-router/js-top-tabs";
import { useTranslation } from "react-i18next";

interface ActivitiesDetailContentProps {
  className?: string;
  session?: ResponseSessionDto<MapSessionPayload> | null;
  handleScroll?: (event: any) => void;
}

const Tab = createMaterialTopTabNavigator();

type FlattenedBookmark =
  | { type: "header"; title: string; id: string }
  | { type: "item"; bookmark: ResponseUserBookmarkDto; id: string };

export const ActivitiesDetailContent = ({
  className,
  session,
  handleScroll,
}: ActivitiesDetailContentProps) => {
  const { t } = useTranslation("activities");
  const {
    bookmarks,
    fetchNextPage,
    hasNextPage,
    isBookmarksPending,
    isFetchingNextPage,
    isRefetching,
    refetchBookmarks,
  } = useInfiniteUserBookmarks({
    join: ["bookmark"],
  });

  const [removedUserIds, setRemovedUserIds] = React.useState<Set<string>>(
    new Set(),
  );

  const handleRemoved = React.useCallback((user?: ResponseUserDto) => {
    if (!user?.id) return;
    setRemovedUserIds((prev) => new Set(prev).add(user.id));
  }, []);

  const renderItem = React.useCallback(
    ({ item }: { item: FlattenedBookmark }) => {
      if (item.type === "header") {
        return (
          <Text className="mb-2.5 mt-2 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {item.title}
          </Text>
        );
      }

      return (
        <BookmarkCard user={item.bookmark.bookmark} onRemoved={handleRemoved} />
      );
    },
    [handleRemoved],
  );

  const flattenedData = React.useMemo<FlattenedBookmark[]>(() => {
    const grouped: Record<string, ResponseUserBookmarkDto[]> = {};

    bookmarks
      .filter((b) => !removedUserIds.has(b.bookmark?.id as string))
      .forEach((bookmark) => {
        const date = parseISO(new Date(bookmark.createdAt).toISOString());

        let title = format(date, "MMMM d, yyyy");

        if (isToday(date)) {
          title = t("activities.groups.today");
        } else if (isYesterday(date)) {
          title = t("activities.groups.yesterday");
        }

        if (!grouped[title]) {
          grouped[title] = [];
        }

        grouped[title].push(bookmark);
      });

    const flattened: FlattenedBookmark[] = [];
    Object.entries(grouped).forEach(([title, data]) => {
      flattened.push({ type: "header", title, id: `header-${title}` });
      data.forEach((bookmark) => {
        flattened.push({
          type: "item",
          bookmark,
          id: `item-${bookmark.id}`,
        });
      });
    });

    return flattened;
  }, [bookmarks, removedUserIds, t]);

  return (
    <View className={cn("flex flex-1 flex-col", className)}>
      <Tab.Navigator
        screenOptions={{
          tabBarScrollEnabled: false,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            textTransform: "none",
          },
          tabBarStyle: { backgroundColor: "transparent" },
        }}
        commonOptions={{
          sceneStyle: {
            flex: 1,
          },
        }}
      >
        <Tab.Screen
          name="Bookmarks"
          options={{
            tabBarLabel: t("activities.tabs.bookmarks.title"),
          }}
        >
          {() =>
            isBookmarksPending ? (
              <BookmarkSkeleton count={3} />
            ) : (
              <LegendList
                style={{ flex: 1, paddingBlock: 12 }}
                data={flattenedData}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                onRefresh={refetchBookmarks}
                refreshing={isRefetching}
                onEndReached={() => {
                  if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                  }
                }}
                onEndReachedThreshold={0.5}
                contentContainerStyle={{
                  paddingHorizontal: 0,
                  flexGrow: 1,
                }}
                renderItem={renderItem}
                ListEmptyComponent={() => (
                  <View className="flex flex-col flex-1 justify-center items-center h-full">
                    <NotFound message={t("activities.bookmarks.empty")} />
                  </View>
                )}
                ListFooterComponent={
                  flattenedData.length === 0 ? null : (
                    <View className="items-center mb-8">
                      {isFetchingNextPage ? (
                        <Loader
                          size="small"
                          className="flex items-center h-fit"
                        />
                      ) : !hasNextPage ? (
                        <View className="flex flex-row items-center justify-center gap-2 px-4">
                          <Text variant="p" className="text-muted-foreground">
                            {t("activities.bookmarks.caughtUp")}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  )
                }
              />
            )
          }
        </Tab.Screen>

        <Tab.Screen
          name="Incoming"
          options={{
            tabBarLabel: t("activities.tabs.incomming.title"),
          }}
        >
          {() => <SessionIncomingRequests handleScroll={handleScroll} />}
        </Tab.Screen>

        <Tab.Screen
          name="Outgoing"
          options={{
            tabBarLabel: t("activities.tabs.outgoing.title"),
          }}
        >
          {() => <SessionOutgoingRequests handleScroll={handleScroll} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};
