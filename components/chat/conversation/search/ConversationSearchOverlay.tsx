import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { LegendList } from "@legendapp/list";
import { ChevronLeft, Search } from "lucide-react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "~/components/ui/icon";
import { Text } from "~/components/ui/text";
import { ResponseMessageDto } from "~/types";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { useColorPalette } from "@/hooks/useColorPalette";
import { useGradualAnimation } from "@/hooks/useGradualAnimation";
import { hslToHex } from "@/lib/theme";
import { useConversationMessageSearch } from "@/hooks/content/chat/useConversationMessageSearch";
import { ConversationSearchResultItem } from "./ConversationSearchResultItem";
import { MarkedInput } from "@/components/shared/MarkedInput";

interface ConversationSearchOverlayProps {
  conversationId: number;
  onClose: () => void;
  onResultPress: (message: ResponseMessageDto) => void;
}

/**
 * Full-screen overlay allowing debounced text searching across all messages in the active conversation.
 */
export const ConversationSearchOverlay = ({
  conversationId,
  onClose,
  onResultPress,
}: ConversationSearchOverlayProps) => {
  const { palette } = useColorPalette();
  const insets = useSafeAreaInsets();
  const { height: keyboardHeight } = useGradualAnimation();

  const keyboardSpacerStyle = useAnimatedStyle(() => ({
    height:
      Platform.OS === "ios"
        ? keyboardHeight.value
        : Math.max(Math.abs(keyboardHeight.value) - insets.bottom, 0),
  }));

  const {
    searchQuery,
    setSearchQuery,
    clearSearch,
    results,
    isSearching,
    isQueryActive,
    resultCount,
  } = useConversationMessageSearch({ conversationId });

  /**
   * Resets search query state and triggers the parent onClose callback.
   */
  const handleClose = React.useCallback(() => {
    clearSearch();
    onClose();
  }, [clearSearch, onClose]);

  /**
   * Resets search query and invokes parent navigation callback to scroll to the chosen message.
   */
  const handleResultPress = React.useCallback(
    (message: ResponseMessageDto) => {
      clearSearch();
      onResultPress(message);
    },
    [clearSearch, onResultPress],
  );

  return (
    <StableSafeAreaView className="absolute inset-0 z-50 flex-1 bg-card">
      {/* header */}
      <View className="flex flex-row justify-between items-center px-2 py-2 bg-card border-b border-border">
        <TouchableOpacity onPress={handleClose} className="p-2 rounded-full">
          <Icon
            as={ChevronLeft}
            size={28}
            color={hslToHex(palette.foreground)}
          />
        </TouchableOpacity>
        <MarkedInput
          icon={Search}
          placeholder="Search in conversation"
          className="flex-1 dark:border-none"
          value={searchQuery}
          onChangeText={setSearchQuery}
          classNames={{
            input: "h-10",
          }}
        />
      </View>
      {/* main */}
      <View className="flex-1 bg-background">
        <LegendList
          style={{ flex: 1 }}
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }: { item: ResponseMessageDto }) => (
            <ConversationSearchResultItem
              message={item}
              searchQuery={searchQuery}
              onPress={() => handleResultPress(item)}
            />
          )}
          ListHeaderComponent={() =>
            isQueryActive ? (
              <View className="px-4 py-3 border-b border-border">
                <Text className="text-muted-foreground text-sm">
                  {isSearching
                    ? "Searching..."
                    : `${resultCount} result${resultCount !== 1 ? "s" : ""}`}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-20">
              {isSearching ? (
                <Text className="text-muted-foreground">Searching...</Text>
              ) : isQueryActive ? (
                <>
                  <Icon as={Search} size={60} color={hslToHex(palette.muted)} />
                  <Text className="text-muted-foreground text-lg mt-4 font-medium">
                    {`No results for "${searchQuery}"`}
                  </Text>
                  <Text className="text-muted-foreground text-center mt-2 px-10">
                    Check spelling or try different keywords
                  </Text>
                </>
              ) : (
                <Text className="text-muted-foreground">
                  Enter a keyword to search in this conversation
                </Text>
              )}
            </View>
          )}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />

        <Animated.View style={keyboardSpacerStyle} />
      </View>
    </StableSafeAreaView>
  );
};
