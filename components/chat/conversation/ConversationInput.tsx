import { Plus, SendHorizonal } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Pressable, View, ViewStyle } from "react-native";
import { type ActionSheetRef } from "react-native-actions-sheet";
import { StablePressable } from "~/components/shared/StablePressable";
import { Icon } from "~/components/ui/icon";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { ConversationInputActionsSheet } from "./ConversationInputActionsSheet";
import { Text } from "@/components/ui/text";

interface ConversationInputProps {
  className?: string;
  style?: ViewStyle;
  input: string;
  setInput: (text: string) => void;
  sendMessage: () => void;
  sendPoke: () => void;
  onPickImage: () => void;
  onPickVideo: () => void;
  isSendingMedia?: boolean;
  isConversationLocked?: boolean;
}

export const ConversationInput = ({
  className,
  style,
  input,
  setInput,
  sendMessage,
  sendPoke,
  onPickImage,
  onPickVideo,
  isSendingMedia = false,
  isConversationLocked = false,
}: ConversationInputProps) => {
  const actionSheetRef = React.useRef<ActionSheetRef>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage();
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
            You can&apos;t send messages in this conversation.
          </Text>
        </View>
      </View>
    );

  return (
    <>
      <ConversationInputActionsSheet
        ref={actionSheetRef}
        onPoke={sendPoke}
        onPickImage={onPickImage}
        onPickVideo={onPickVideo}
        disabled={isSendingMedia}
      />
      <View
        className={cn(
          "bg-background/95 border-t border-border py-2",
          className,
        )}
        style={{
          zIndex: 20,
        }}
      >
        <View className="flex flex-row items-end gap-2 px-3 py-2">
          {/* Add Button */}
          <StablePressable
            className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full mb-0.5"
            onPress={() => actionSheetRef.current?.show()}
            disabled={isSendingMedia}
            accessibilityLabel="Add attachment"
          >
            {isSendingMedia ? (
              <ActivityIndicator size="small" />
            ) : (
              <Icon as={Plus} size={20} />
            )}
          </StablePressable>

          {/* Text Input */}
          <Textarea
            value={input}
            onChangeText={setInput}
            placeholder={"Aa"}
            multiline
            style={{ minHeight: 40, maxHeight: 120, height: "auto" }}
            className="flex-1 px-4 py-2 rounded-2xl bg-input text-base"
          />

          {/* Send Button */}
          <Pressable
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full mb-0.5",
              input.trim() ? "bg-primary" : "bg-muted",
            )}
            onPress={handleSend}
            disabled={!input.trim()}
            accessibilityLabel="Send message"
          >
            <Icon
              as={SendHorizonal}
              size={18}
              color={input.trim() ? "white" : "gray"}
            />
          </Pressable>
        </View>
      </View>
    </>
  );
};
