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

type GroupedBookmarks = {
  title: string;
  data: ResponseUserBookmarkDto[];
};

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

  const groupedBookmarks = React.useMemo<GroupedBookmarks[]>(() => {
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

    return Object.entries(grouped).map(([title, data]) => ({
      title,
      data,
    }));
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
                data={groupedBookmarks}
                keyExtractor={(item) => item.title}
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
                renderItem={({ item }) => (
                  <View className="mb-6">
                    <Text className="px-4 mb-2 text-sm font-semibold text-muted-foreground">
                      {item.title}
                    </Text>

                    {item.data.map((bookmark) => (
                      <BookmarkCard
                        key={bookmark.id}
                        className="px-4 py-1"
                        user={bookmark.bookmark}
                      />
                    ))}
                  </View>
                )}
              />
            )
          }
        </Tab.Screen>

        <Tab.Screen name="Incoming">
          {() => <SessionIncomingRequests />}
        </Tab.Screen>

        <Tab.Screen name="Outgoing">
          {() => <SessionOutgoingRequests />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};
