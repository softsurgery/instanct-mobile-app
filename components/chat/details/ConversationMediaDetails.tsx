import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Pressable,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Play } from "lucide-react-native";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { useColorPalette } from "@/hooks/useColorPalette";
import { hslToHex } from "@/lib/theme";
import { useConversationMessages } from "@/hooks/content/chat/useConversationMessages";
import { MessageVariant, ResponseMessageDto } from "@/types";
import { Image } from "@/components/ui/image";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { PhotoPreview } from "~/components/shared/PhotoPreview";
import { Icon } from "~/components/ui/icon";

type Tab = "Media" | "Files" | "Links";
const TABS: Tab[] = ["Media", "Files", "Links"];

interface ConversationMediaDetailsProps {
  id: string;
}

const MediaThumbnail = ({
  message,
  size,
}: {
  message: ResponseMessageDto;
  size: number;
}) => {
  const upload = message.uploads?.[0]?.upload;
  const uploadId = message.uploads?.[0]?.uploadId ?? upload?.id;

  const { data: mediaSource, isPending } = useQuery({
    queryKey: ["chat-media", uploadId],
    queryFn: () => api.upload.getUploadById(uploadId as number),
    enabled: typeof uploadId === "number",
  });

  const isVideo = message.variant === MessageVariant.VIDEO;

  if (isPending) {
    return (
      <View style={{ width: size, height: size, padding: 1 }}>
        <View className="flex-1 bg-muted items-center justify-center">
          <ActivityIndicator size="small" />
        </View>
      </View>
    );
  }

  const content = (
    <View style={{ width: size, height: size, padding: 1 }}>
      {isVideo ? (
        <View className="flex-1 bg-muted items-center justify-center relative">
          <View className="w-10 h-10 rounded-full items-center justify-center bg-black/50 absolute z-10">
            <Icon as={Play} size={20} color="white" />
          </View>
          {mediaSource && (
            <Image
              className="w-full h-full"
              source={mediaSource}
              contentFit="cover"
            />
          )}
        </View>
      ) : mediaSource ? (
        <Image
          className="w-full h-full"
          source={mediaSource}
          contentFit="cover"
        />
      ) : (
        <View className="flex-1 bg-muted items-center justify-center">
          <Text className="text-muted-foreground text-xs">No Media</Text>
        </View>
      )}
    </View>
  );

  if (!isVideo && mediaSource) {
    return <PhotoPreview source={mediaSource}>{content}</PhotoPreview>;
  }

  return <Pressable>{content}</Pressable>;
};

export const ConversationMediaDetails = ({
  id,
}: ConversationMediaDetailsProps) => {
  const { palette } = useColorPalette();
  const conversationId = Number(id);
  const [activeTab, setActiveTab] = React.useState<Tab>("Media");

  const {
    messages: mediaMessages,
    isMessagesPending: isLoadingMedia,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversationMessages({
    id: conversationId,
    query: {
      limit: "20",
      filter: "variant||$in||image,video",
    },
  });

  const numColumns = 3;
  const screenWidth = Dimensions.get("window").width;
  const imageSize = screenWidth / numColumns;

  return (
    <StableSafeAreaView className="flex-1 bg-card">
      <ApplicationHeader
        title="Media, files and links"
        titleVariant="large"
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => router.back(),
          },
        ]}
        reverse
        classNames={{ wrapper: "border-b border-border pb-2 bg-card" }}
      />

      <View className="flex-row border-b border-border">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-4 items-center border-b-2 ${
                isActive ? "border-primary" : "border-transparent"
              }`}
            >
              <Text
                className={`font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-1 bg-background">
        {activeTab === "Media" && (
          <FlatList
            data={mediaMessages}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            renderItem={({ item }) => (
              <MediaThumbnail message={item} size={imageSize} />
            )}
            onEndReached={() => {
              if (hasNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
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
        )}

        {activeTab === "Files" && (
          <View className="flex-1 items-center justify-center mt-10">
            <Text className="text-muted-foreground">No files found</Text>
          </View>
        )}

        {activeTab === "Links" && (
          <View className="flex-1 items-center justify-center mt-10">
            <Text className="text-muted-foreground">No links found</Text>
          </View>
        )}
      </View>
    </StableSafeAreaView>
  );
};
