import { Text } from "@/components/ui/text";
import { useConversationMessages } from "@/hooks/content/chat/useConversationMessages";
import { useColorPalette } from "@/hooks/useColorPalette";
import { hslToHex } from "@/lib/theme";
import { CONVERSATION_LINKS_MESSAGES_QUERY } from "@/lib/chat";
import { getMessageLinksForDisplay } from "@/lib/messageLinks";
import { ResponseMessageDto, ResponseMessageLinkDto } from "@/types";
import { LegendList } from "@legendapp/list";
import { useFocusEffect } from "expo-router";
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

/**
 * Tab/screen listing all URL links shared across messages in a conversation.
 */
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
    refecthMessages,
  } = useConversationMessages({
    id,
    query: CONVERSATION_LINKS_MESSAGES_QUERY,
  });

  useFocusEffect(
    React.useCallback(() => {
      void refecthMessages();
    }, [refecthMessages]),
  );

  const linkItems = React.useMemo(() => {
    const items: ConversationLinkItem[] = [];

    for (const message of messages) {
      getMessageLinksForDisplay(message).forEach((link) => {
        const linkId = "id" in link && link.id ? link.id : "local";

        items.push({
          key: `${message.id}-${linkId}-${link.order}-${link.startOffset}`,
          messageId: message.id,
          message,
          link: link as ResponseMessageLinkDto,
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
