import { Text } from "@/components/ui/text";
import { useConversationMessages } from "@/hooks/content/chat/useConversationMessages";
import { useColorPalette } from "@/hooks/useColorPalette";
import { hslToHex } from "@/lib/theme";
import { MessageVariant } from "@/types";
import { LegendList } from "@legendapp/list";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { FileListItem, getMessageUploadEntries } from "./FileListItem";
import { useTranslation } from "react-i18next";

type ConversationFileItem = {
  key: string;
  messageId: number;
  uploadId: number;
  message: ReturnType<typeof useConversationMessages>["messages"][number];
  upload?: ReturnType<typeof getMessageUploadEntries>[number]["upload"];
};

interface ConversationFilesDetailsProps {
  id: number;
}

/**
 * Tab/screen listing all document and file attachments shared within a conversation.
 */
export const ConversationFilesDetails = ({
  id,
}: ConversationFilesDetailsProps) => {
  const { t } = useTranslation("chat");
  const { palette } = useColorPalette();
  const endReachedDuringMomentum = React.useRef(false);

  const {
    messages: fileMessages,
    isMessagesPending: isLoadingFiles,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversationMessages({
    id,
    query: {
      limit: "20",
      sort: "createdAt,DESC",
    },
    variants: [MessageVariant.FILE],
  });

  const fileItems = React.useMemo(() => {
    const items: ConversationFileItem[] = [];

    for (const message of fileMessages) {
      getMessageUploadEntries(message).forEach(({ uploadId, upload }, index) => {
        items.push({
          key: `${message.id}-${uploadId}-${index}`,
          messageId: message.id,
          uploadId,
          message,
          upload,
        });
      });
    }

    return items;
  }, [fileMessages]);

  const handleEndReached = React.useCallback(() => {
    if (endReachedDuringMomentum.current) {
      return;
    }

    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderFileItem = React.useCallback(
    ({ item }: { item: ConversationFileItem }) => (
      <FileListItem
        message={item.message}
        uploadId={item.uploadId}
        upload={item.upload}
      />
    ),
    [],
  );

  return (
    <LegendList
      data={fileItems}
      keyExtractor={(item) => item.key}
      renderItem={renderFileItem}
      onEndReached={handleEndReached}
      onMomentumScrollBegin={() => {
        endReachedDuringMomentum.current = false;
      }}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={() => (
        <View className="flex-1 items-center justify-center py-10 mt-10">
          {isLoadingFiles ? (
            <ActivityIndicator size="small" color={hslToHex(palette.primary)} />
          ) : (
            <Text className="text-muted-foreground">
              {t("chat.resources.empty.files")}
            </Text>
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
