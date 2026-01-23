import { api } from "@/api";
import { useNotificationContext } from "@/contexts/NotificationsContext";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { ResponseUserDto } from "@/types/user-management";
import { LegendList } from "@legendapp/list";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import React from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ApplicationHeader } from "../shared/AppHeader";
import { Loader } from "../shared/Loader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { Skeleton } from "../ui/skeleton";
import { Text } from "../ui/text";
import { UserCard } from "./UserCard";

interface ExplorePortalProps {
  className?: string;
}

export const ExplorePortal = ({ className }: ExplorePortalProps) => {
  const { newCount, resetCount } = useNotificationContext();
  const [dragging, setDragging] = React.useState(false);

  const showHeader = useSharedValue(true);
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(showHeader.value ? 0 : -60, {
          duration: 250,
        }),
      },
    ],
    opacity: withTiming(showHeader.value ? 1 : 0, { duration: 250 }),
    height: withTiming(showHeader.value ? 60 : 0, {
      duration: 250,
    }),
  }));

  const handleHeaderVisibility = React.useCallback(
    (visible: boolean) => {
      showHeader.value = visible;
    },
    [showHeader],
  );

  // Track scroll direction
  const lastOffsetY = React.useRef(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffsetY = e.nativeEvent.contentOffset.y;

    const delta = currentOffsetY - lastOffsetY.current;
    if (currentOffsetY <= 0) {
      handleHeaderVisibility(true);
    } else if (delta < -10) {
      handleHeaderVisibility(true); // scrolling up
    } else if (delta > 0) {
      handleHeaderVisibility(false); // scrolling down
    }

    lastOffsetY.current = currentOffsetY;
  };

  const { value: debouncedDragging, loading: isDragging } = useDebounce(
    dragging,
    1000,
  );

  const {
    data: usersResponse,
    isPending: refreching,
    refetch: refrech,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.user.findAll(),
  });

  const users = React.useMemo(() => usersResponse ?? [], [usersResponse]);

  const handleNotificationsPress = React.useCallback(() => {
    resetCount();
    router.push("/main/notifications");
  }, [resetCount]);

  const handleChatPress = React.useCallback(() => {
    router.push("/main/chat");
  }, []);

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseUserDto }) => (
      <UserCard className="mx-4" user={item} />
    ),
    [],
  );

  return (
    <StableSafeAreaView
      className={cn("flex flex-1 flex-col bg-background", className)}
    >
      <Animated.View style={animatedHeaderStyle}>
        <ApplicationHeader
          title="Explore"
          shortcuts={[
            {
              icon: Bell,
              onPress: handleNotificationsPress,
              badgeText: newCount > 0 ? String(newCount) : undefined,
            },
            {
              icon: IconMessageChatbot,
              onPress: handleChatPress,
            },
          ]}
        />
      </Animated.View>
      <LegendList
        className={cn("flex-1")}
        data={users}
        onScroll={handleScroll}
        onScrollBeginDrag={() => setDragging(true)}
        onScrollEndDrag={() => setDragging(false)}
        showsVerticalScrollIndicator={false}
        recycleItems={true}
        maintainVisibleContentPosition
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreching} onRefresh={refrech} />
        }
        ListHeaderComponent={
          <Loader
            size="small"
            isPending={refreching || debouncedDragging || isDragging}
            className="flex items-center h-fit"
          />
        }
        ListFooterComponent={
          <View className="items-center">
            {refreching ? (
              <Skeleton />
            ) : (
              <View className="flex flex-row items-center justify-center gap-2 p-6">
                <Text className="text-muted-foreground text-sm font-semibold">
                  You reached the end of the list
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={renderItem}
        contentContainerStyle={{ gap: 10 }}
      />
    </StableSafeAreaView>
  );
};
