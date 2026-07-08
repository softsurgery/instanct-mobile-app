import { Text } from "@/components/ui/text";
import { useConversationMessages } from "@/hooks/content/chat/useConversationMessages";
import { useColorPalette } from "@/hooks/useColorPalette";
import { hslToHex } from "@/lib/theme";
import { ResponseMessageDto, ResponseMessageLinkDto } from "@/types";
import { LegendList } from "@legendapp/list";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { LinkListItem } from "./LinkListItem";

type ConversationLinkItem = {
  key: string;
  messageId: number;
  message: ResponseMessageDto;
  link: ResponseMessageLinkDto;
};

interface ConversationLinksDetailsProps {
  id: number;
}

export const ConversationLinksDetails = ({
  id,
}: ConversationLinksDetailsProps) => {
  const { palette } = useColorPalette();
  const endReachedDuringMomentum = React.useRef(false);

  const {
    messages,
    isMessagesPending: isLoadingLinks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversationMessages({
    id,
    query: {
      limit: "20",
      sort: "createdAt,DESC",
      join: "links",
    },
  });

  const linkItems = React.useMemo(() => {
    const items: ConversationLinkItem[] = [];

    for (const message of messages) {
      const sortedLinks = [...(message.links ?? [])].sort(
        (a, b) => a.order - b.order,
      );

      sortedLinks.forEach((link) => {
        items.push({
          key: `${message.id}-${link.id}-${link.order}`,
          messageId: message.id,
          message,
          link,
        });
      });
    }

    return items;
  }, [messages]);

  React.useEffect(() => {
    if (
      !isLoadingLinks &&
      linkItems.length === 0 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoadingLinks,
    linkItems.length,
  ]);

  const handleEndReached = React.useCallback(() => {
    if (endReachedDuringMomentum.current) {
      return;
    }

    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderLinkItem = React.useCallback(
    ({ item }: { item: ConversationLinkItem }) => (
      <LinkListItem message={item.message} link={item.link} />
    ),
    [],
  );

  return (
    <LegendList
      data={linkItems}
      keyExtractor={(item) => item.key}
      renderItem={renderLinkItem}
      onEndReached={handleEndReached}
      onMomentumScrollBegin={() => {
        endReachedDuringMomentum.current = false;
      }}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={() => (
        <View className="flex-1 items-center justify-center py-10 mt-10">
          {isLoadingLinks ? (
            <ActivityIndicator size="small" color={hslToHex(palette.primary)} />
          ) : (
            <Text className="text-muted-foreground">No links found</Text>
          )}
        </View>
      )}
      ListFooterComponent={() =>
        isFetchingNextPage ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color={hslToHex(palette.primary)} />
          </View>
        ) : null
      }
    />
  );
};
