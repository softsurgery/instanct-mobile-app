import { Text } from "@/components/ui/text";
import { useConversationMessages } from "@/hooks/content/chat/useConversationMessages";
import { useColorPalette } from "@/hooks/useColorPalette";
import { hslToHex } from "@/lib/theme";
import { MessageVariant, ResponseMessageDto } from "@/types";
import { LegendList } from "@legendapp/list";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageURISource,
  View,
} from "react-native";
import ImageView from "react-native-image-viewing";
import { api } from "~/api";
import { getMessageUploadId, MediaThumbnail } from "./MediaThumbnail";

const NUM_COLUMNS = 3;

interface ConversationMediaDetailsProps {
  id: number;
}

export const ConversationMediaDetails = ({
  id,
}: ConversationMediaDetailsProps) => {
  const { palette } = useColorPalette();
  const [viewerVisible, setViewerVisible] = React.useState(false);
  const [viewerIndex, setViewerIndex] = React.useState(0);

  const endReachedDuringMomentum = React.useRef(false);

  const {
    messages: mediaMessages,
    isMessagesPending: isLoadingMedia,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversationMessages({
    id,
    query: {
      limit: "20",
      sort: "createdAt,DESC",
    },
    variants: [MessageVariant.IMAGE, MessageVariant.VIDEO],
  });

  const imageMessages = React.useMemo(
    () =>
      mediaMessages.filter(
        (message) => message.variant !== MessageVariant.VIDEO,
      ),
    [mediaMessages],
  );

  const imageIndexByMessageId = React.useMemo(() => {
    const map = new Map<number, number>();

    imageMessages.forEach((message, index) => {
      map.set(message.id, index);
    });

    return map;
  }, [imageMessages]);

  const viewerImages = React.useMemo(() => {
    return imageMessages.flatMap((message) => {
      const uploadId = getMessageUploadId(message);

      if (typeof uploadId !== "number") {
        return [];
      }

      const source = api.upload.getUploadSource(uploadId);
      return [source as ImageURISource];
    });
  }, [imageMessages]);

  const openViewer = React.useCallback(
    (messageId: number) => {
      const index = imageIndexByMessageId.get(messageId);

      if (index === undefined || viewerImages[index] === undefined) {
        return;
      }

      setViewerIndex(index);
      setViewerVisible(true);
    },
    [imageIndexByMessageId, viewerImages],
  );

  const mediaRows = React.useMemo(() => {
    const rows: ResponseMessageDto[][] = [];

    for (let index = 0; index < mediaMessages.length; index += NUM_COLUMNS) {
      rows.push(mediaMessages.slice(index, index + NUM_COLUMNS));
    }

    return rows;
  }, [mediaMessages]);

  const screenWidth = Dimensions.get("window").width;
  const imageSize = screenWidth / NUM_COLUMNS;

  const handleEndReached = React.useCallback(() => {
    if (endReachedDuringMomentum.current) {
      return;
    }

    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderMediaRow = React.useCallback(
    ({ item: row }: { item: ResponseMessageDto[] }) => (
      <View className="flex-row">
        {row.map((message) => {
          const uploadId = getMessageUploadId(message);
          const resolvedUploadId =
            typeof uploadId === "number" ? uploadId : undefined;
          const isImage = message.variant !== MessageVariant.VIDEO;

          return (
            <MediaThumbnail
              key={message.id}
              message={message}
              size={imageSize}
              uploadId={resolvedUploadId}
              onPress={
                isImage && resolvedUploadId
                  ? () => openViewer(message.id)
                  : undefined
              }
            />
          );
        })}
        {row.length < NUM_COLUMNS
          ? Array.from({ length: NUM_COLUMNS - row.length }).map((_, index) => (
              <View
                key={`spacer-${index}`}
                style={{ width: imageSize, height: imageSize }}
              />
            ))
          : null}
      </View>
    ),
    [imageSize, openViewer],
  );

  return (
    <>
      <LegendList
        data={mediaRows}
        keyExtractor={(_, index) => `media-row-${index}`}
        renderItem={renderMediaRow}
        onEndReached={handleEndReached}
        onMomentumScrollBegin={() => {
          endReachedDuringMomentum.current = false;
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-10 mt-10">
            {isLoadingMedia ? (
              <ActivityIndicator
                size="small"
                color={hslToHex(palette.primary)}
              />
            ) : (
              <Text className="text-muted-foreground">No media found</Text>
            )}
          </View>
        )}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator
                size="small"
                color={hslToHex(palette.primary)}
              />
            </View>
          ) : null
        }
      />
      {viewerVisible && viewerImages.length > 0 ? (
        <ImageView
          images={viewerImages}
          imageIndex={viewerIndex}
          visible={viewerVisible}
          onRequestClose={() => setViewerVisible(false)}
          backgroundColor="rgba(0, 0, 0, 0.9)"
          presentationStyle="overFullScreen"
        />
      ) : null}
    </>
  );
};
