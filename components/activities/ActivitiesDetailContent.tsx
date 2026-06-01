import React from "react";
import type { MapSessionPayload, ResponseSessionDto } from "@/types/session";
import { View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SessionIncomingRequests } from "./SessionIncomingRequests";
import { SessionOutgoingRequests } from "./SessionOutgoingRequests";
import { Text } from "../ui/text";
import { useInfiniteUserBookmarks } from "@/hooks/content/users/useInfinteUserBookmarks";
import { LegendList } from "@legendapp/list";
import { BookmarkCard } from "./BookmarkCard";
import { ResponseUserBookmarkDto } from "@/types/bookmark";
import { Loader } from "@/components/shared/Loader";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, parseISO } from "date-fns";

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

  const renderItem = React.useCallback(
    ({ item }: { item: FlattenedBookmark }) => {
      if (item.type === "header") {
        return (
          <Text className="mb-2.5 mt-2 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {item.title}
          </Text>
        );
      }

      return <BookmarkCard user={item.bookmark.bookmark} />;
    },
    [],
  );

  const flattenedData = React.useMemo<FlattenedBookmark[]>(() => {
    const grouped: Record<string, ResponseUserBookmarkDto[]> = {};

    bookmarks.forEach((bookmark) => {
      const date = parseISO(new Date(bookmark.createdAt).toISOString());

      let title = format(date, "MMMM d, yyyy");

      if (isToday(date)) {
        title = "Today";
      } else if (isYesterday(date)) {
        title = "Yesterday";
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
  }, [bookmarks]);

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
        <Tab.Screen name="Bookmarks">
          {() =>
            isBookmarksPending ? (
              <View className="flex-1 items-center justify-center">
                <Loader />
              </View>
            ) : bookmarks.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-center text-muted-foreground px-6">
                  No bookmarks yet.
                </Text>
              </View>
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
                  paddingBottom: 24,
                }}
                renderItem={renderItem}
              />
            )
          }
        </Tab.Screen>

        <Tab.Screen name="Incoming">
          {() => <SessionIncomingRequests handleScroll={handleScroll} />}
        </Tab.Screen>

        <Tab.Screen name="Outgoing">
          {() => <SessionOutgoingRequests handleScroll={handleScroll} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};
