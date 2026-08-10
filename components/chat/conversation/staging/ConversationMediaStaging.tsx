import React from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { ImagePlus, Play, SendHorizonalIcon, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "~/components/ui/icon";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { VideoThumbnailPreview } from "~/components/shared/VideoThumbnailPreview";
import { StagedMedia } from "@/types";
import { useTranslation } from "react-i18next";

interface ConversationMediaStagingProps {
  className?: string;
  stagedMedia: StagedMedia[];
  onConfirm: (caption?: string) => void;
  onCancel: () => void;
  onRemove: (id: string) => void;
  onAddMore: () => void;
}

/**
 * Fullscreen video preview player for a staged video asset.
 */
const StagedVideoPreview = ({ uri }: { uri: string }) => {
  const player = useVideoPlayer({ uri }, (instance) => {
    instance.loop = true;
    instance.play();
  });

  return (
    <VideoView
      style={{ width: "100%", height: "100%" }}
      player={player}
      nativeControls
      contentFit="contain"
    />
  );
};

/**
 * Thumbnail strip card representing an individual staged photo or video item.
 */
const StagedThumbnail = ({
  item,
  selected,
  onPress,
  onRemove,
}: {
  item: StagedMedia;
  selected: boolean;
  onPress: () => void;
  onRemove: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={cn(
      "relative rounded-xl overflow-hidden border-2",
      selected ? "border-primary" : "border-transparent",
    )}
    style={{ width: 120, height: 120 }}
  >
    {item.kind === "image" ? (
      <Image
        source={{ uri: item.uri }}
        style={{ width: "100%", height: "100%", opacity: 0.7 }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    ) : (
      <View className="w-full h-full bg-muted items-center justify-center">
        <VideoThumbnailPreview source={{ uri: item.uri }} />
        <View className="w-7 h-7 rounded-full bg-background/55 items-center justify-center">
          <Icon as={Play} size={12} color="white" fill="white" />
        </View>
      </View>
    )}

    <Pressable
      onPress={onRemove}
      hitSlop={8}
      className="absolute top-1 right-2 w-6 h-6 rounded-full bg-black/70 items-center justify-center"
    >
      <Icon as={X} size={16} color="white" />
    </Pressable>
  </Pressable>
);

/**
 * Fullscreen modal overlay for previewing, adding, removing, and confirming staged media prior to sending.
 */
export const ConversationMediaStaging = ({
  className,
  stagedMedia,
  onConfirm,
  onCancel,
  onRemove,
  onAddMore,
}: ConversationMediaStagingProps) => {
  const { t } = useTranslation("chat");
  const insets = useSafeAreaInsets();
  const [caption, setCaption] = React.useState("");
  const [selectedIndexRaw, setSelectedIndex] = React.useState(0);
  const previewRef = React.useRef<FlatList<StagedMedia>>(null);
  const screenWidth = Dimensions.get("window").width;

  const selectedIndex =
    stagedMedia.length === 0
      ? 0
      : Math.min(selectedIndexRaw, stagedMedia.length - 1);

  const handlePreviewScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (index >= 0 && index < stagedMedia.length) {
      setSelectedIndex(index);
    }
  };

  const selectPreviewIndex = React.useCallback((index: number) => {
    setSelectedIndex(index);
    previewRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const handleSend = () => {
    onConfirm(caption);
    setCaption("");
  };

  const handleCancel = () => {
    setCaption("");
    setSelectedIndex(0);
    onCancel();
  };

  const isVisible = stagedMedia.length > 0;

  if (!isVisible) return null;

  const selectedItem = stagedMedia[selectedIndex] ?? stagedMedia[0];
  const mediaLabel =
    stagedMedia.length === 1
      ? selectedItem.kind === "video"
        ? t("chat.conversation.staging.video", { count: 1 })
        : t("chat.conversation.staging.photo", { count: 1 })
      : t("chat.conversation.staging.items", { count: stagedMedia.length });

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
    >
      <View className={cn("flex-1 bg-card", className)}>
        <View
          className="flex-row items-center justify-between px-4 border-b border-border bg-background"
          style={{ paddingTop: insets.top + 8, paddingBottom: 10 }}
        >
          <TouchableOpacity
            onPress={handleCancel}
            className="w-10 h-10 items-center justify-center rounded-full bg-muted"
          >
            <Icon as={X} size={22} />
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-foreground">
            {mediaLabel}
          </Text>

          <TouchableOpacity
            onPress={handleSend}
            className="w-10 h-10 items-center justify-center rounded-full bg-muted"
          >
            <Icon as={SendHorizonalIcon} size={28} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 bg-black">
          <FlatList
            ref={previewRef}
            data={stagedMedia}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={handlePreviewScroll}
            onScrollToIndexFailed={(info) => {
              previewRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }}
            style={{ flex: 1 }}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={{ width: screenWidth, height: "100%" }}>
                {item.kind === "image" ? (
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="contain"
                  />
                ) : (
                  <StagedVideoPreview uri={item.uri} />
                )}
              </View>
            )}
          />

          {stagedMedia.length > 1 && (
            <View className="absolute bottom-3 self-center bg-black/55 px-3 py-1 rounded-full">
              <Text className="text-foreground font-medium">
                {selectedIndex + 1} / {stagedMedia.length}
              </Text>
            </View>
          )}
        </View>

        <View
          className="border-t border-border bg-card"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-4 py-3 gap-2 items-center"
          >
            <Pressable
              onPress={onAddMore}
              className="rounded-xl border border-dashed border-border items-center justify-center"
              style={{ width: 115, height: 115 }}
            >
              <Icon
                as={ImagePlus}
                size={36}
                strokeWidth={1.5}
                className="text-muted-foreground"
              />
            </Pressable>
            {stagedMedia.map((item, index) => (
              <StagedThumbnail
                key={item.id}
                item={item}
                selected={index === selectedIndex}
                onPress={() => selectPreviewIndex(index)}
                onRemove={() => onRemove(item.id)}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
