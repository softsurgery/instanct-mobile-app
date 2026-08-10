import { Hand, Plus, SendHorizonalIcon } from "lucide-react-native";
import React from "react";
import { View, ViewStyle, TouchableOpacity, Platform } from "react-native";
import { type ActionSheetRef } from "react-native-actions-sheet";
import { Icon } from "~/components/ui/icon";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { ConversationInputActionsSheet } from "./ConversationInputActionsSheet";
import { Text } from "@/components/ui/text";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";

interface ConversationInputProps {
  className?: string;
  style?: ViewStyle;
  input: string;
  setInput: (text: string) => void;
  sendMessage: () => void;
  sendPoke: () => void;
  onPickImage: () => void;
  onPickVideo: () => void;
  onPickFile: () => void;
  isConversationLocked?: boolean;
}

/**
 * Text input bar at the bottom of the conversation screen with attachment sheet launcher and send/poke buttons.
 */
export const ConversationInput = ({
  className,
  style,
  input,
  setInput,
  sendMessage,
  sendPoke,
  onPickImage,
  onPickVideo,
  onPickFile,
  isConversationLocked = false,
}: ConversationInputProps) => {
  const { t } = useTranslation("chat");
  const isKeyboardVisible = useKeyboardVisible();
  const actionSheetRef = React.useRef<ActionSheetRef>(null);

  /**
   * Validates non-empty text input, triggers message sending, and clears the input field.
   */
  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage();
    setInput("");
  };

  if (isConversationLocked)
    return (
      <View
        className={cn("bg-background/95 border-t border-border", className)}
        style={{
          ...style,
          zIndex: 20,
        }}
      >
        <View className="flex flex-row items-center justify-center gap-2 px-3 py-6">
          <Text className="text-sm text-muted-foreground">
            {t("chat.conversation.locked")}
          </Text>
        </View>
      </View>
    );

  return (
    <View
      className={cn(
        "bg-background/95 border-t border-border py-4 z-20",
        isKeyboardVisible ? "pb-4" : Platform.OS === "ios" ? "pb-8" : "pb-4",
        className,
      )}
    >
      <ConversationInputActionsSheet
        ref={actionSheetRef}
        onPoke={sendPoke}
        onPickImage={onPickImage}
        onPickVideo={onPickVideo}
        onPickFile={onPickFile}
      />
      <View className="flex flex-row items-center justify-between gap-2 px-4 py-0.5">
        {/* Add Button */}

        <TouchableOpacity onPress={() => actionSheetRef.current?.show()}>
          <Icon as={Plus} size={24} />
        </TouchableOpacity>

        {/* Text Input */}
        <Textarea
          value={input}
          onChangeText={setInput}
          placeholder={t("chat.conversation.inputPlaceholder")}
          multiline
          style={{ minHeight: 40, maxHeight: 120, height: "auto" }}
          className="flex-1 px-4 py-2 rounded-2xl bg-input text-base"
        />

        {/* Send Button */}
        <View
          style={{
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {input.trim().length > 0 ? (
            <Animated.View
              key="send"
              entering={FadeIn.duration(180).springify()}
              exiting={FadeOut.duration(120)}
            >
              <TouchableOpacity onPress={handleSend}>
                <Icon as={SendHorizonalIcon} size={24} strokeWidth={1.5} />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View
              key="hand"
              entering={ZoomIn.duration(180)}
              exiting={ZoomOut.duration(120)}
            >
              <TouchableOpacity onPress={sendPoke}>
                <Icon as={Hand} size={24} strokeWidth={1.5} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
};
