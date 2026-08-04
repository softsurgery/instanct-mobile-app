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
  Modal,
  ScrollView,
  View,
} from "react-native";
import { GestureViewer } from "react-native-gesture-image-viewer";
import { Image } from "expo-image";
import { useServerImages } from "@/hooks/content/useServerImages";
import { getMessageUploadIds, MediaThumbnail } from "./MediaThumbnail";
import { useTranslation } from "react-i18next";

const NUM_COLUMNS = 3;

type MediaGridItem = {
  key: string;
  message: ResponseMessageDto;
  uploadId?: number;
};

interface ConversationMediaDetailsProps {
  id: number;
}

/**
 * Grid gallery view displaying all images and videos shared in the conversation with fullscreen gesture viewer.
 */
export const ConversationMediaDetails = ({
  id,
}: ConversationMediaDetailsProps) => {
  const { t } = useTranslation("chat");
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

  const mediaItems = React.useMemo(() => {
    const items: MediaGridItem[] = [];

    for (const message of mediaMessages) {
      const uploadIds = getMessageUploadIds(message);

      if (uploadIds.length === 0) {
        items.push({
          key: `${message.id}`,
          message,
        });
        continue;
      }

      uploadIds.forEach((uploadId, index) => {
        items.push({
          key: `${message.id}-${uploadId}-${index}`,
          message,
          uploadId,
        });
      });
    }

    return items;
  }, [mediaMessages]);

  const imageItems = React.useMemo(
    () =>
      mediaItems.filter(
        (item) =>
          item.message.variant !== MessageVariant.VIDEO &&
          typeof item.uploadId === "number",
      ),
    [mediaItems],
  );

  const imageIndexByKey = React.useMemo(() => {
    const map = new Map<string, number>();

    imageItems.forEach((item, index) => {
      map.set(item.key, index);
    });

    return map;
  }, [imageItems]);

  const imageUploadIds = React.useMemo(() => {
    return imageItems
      .map((item) => item.uploadId)
      .filter((id): id is number => typeof id === "number");
  }, [imageItems]);

  const { uploads } = useServerImages({
    ids: imageUploadIds,
  });

  const viewerImages = React.useMemo(() => {
    return uploads.filter((u: any) => !!u) as ImageURISource[];
  }, [uploads]);

  const openViewer = React.useCallback(
    (itemKey: string) => {
      const index = imageIndexByKey.get(itemKey);

      if (index === undefined || viewerImages[index] === undefined) {
        return;
      }

      setViewerIndex(index);
      setViewerVisible(true);
    },
    [imageIndexByKey, viewerImages],
  );

  const mediaRows = React.useMemo(() => {
    const rows: MediaGridItem[][] = [];

    for (let index = 0; index < mediaItems.length; index += NUM_COLUMNS) {
      rows.push(mediaItems.slice(index, index + NUM_COLUMNS));
    }

    return rows;
  }, [mediaItems]);

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
    ({ item: row }: { item: MediaGridItem[] }) => (
      <View className="flex-row">
        {row.map((item) => {
          const isImage = item.message.variant !== MessageVariant.VIDEO;

          return (
            <MediaThumbnail
              key={item.key}
              message={item.message}
              size={imageSize}
              uploadId={item.uploadId}
              onPress={
                isImage && item.uploadId
                  ? () => openViewer(item.key)
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
              <Text className="text-muted-foreground">
                {t("chat.resources.empty.media")}
              </Text>
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
        <Modal
          transparent
          visible={viewerVisible}
          presentationStyle="overFullScreen"
          onRequestClose={() => setViewerVisible(false)}
        >
          <GestureViewer
            data={viewerImages}
            initialIndex={viewerIndex}
            renderItem={(item) => (
              <Image
                source={item}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
              />
            )}
            ListComponent={ScrollView}
            onDismiss={() => setViewerVisible(false)}
            backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
          />
        </Modal>
      ) : null}
    </>
  );
};
