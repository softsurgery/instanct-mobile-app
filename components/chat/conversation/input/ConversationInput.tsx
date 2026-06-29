import { Hand, Plus, SendHorizonal } from "lucide-react-native";
import React from "react";
import { View, ViewStyle, TouchableOpacity } from "react-native";
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

interface ConversationInputProps {
  className?: string;
  style?: ViewStyle;
  input: string;
  setInput: (text: string) => void;
  sendMessage: () => void;
  sendPoke: () => void;
  onPickImage: () => void;
  onPickVideo: () => void;
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
  isConversationLocked = false,
}: ConversationInputProps) => {
  const isKeyboardVisible = useKeyboardVisible();
  const actionSheetRef = React.useRef<ActionSheetRef>(null);

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
            You can&apos;t send messages in this conversation.
          </Text>
        </View>
      </View>
    );

  return (
    <View
      className={cn(
        "bg-background/95 border-t border-border py-2",
        isKeyboardVisible ? "pb-4" : "pb-8",
        className,
      )}
      style={{
        zIndex: 20,
      }}
    >
      <ConversationInputActionsSheet
        ref={actionSheetRef}
        onPoke={sendPoke}
        onPickImage={onPickImage}
        onPickVideo={onPickVideo}
      />
      <View className="flex flex-row items-center justify-between gap-2 px-6 py-0.5">
        {/* Add Button */}

        <TouchableOpacity onPress={() => actionSheetRef.current?.show()}>
          <Icon as={Plus} size={24} />
        </TouchableOpacity>

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
                <Icon
                  as={SendHorizonal}
                  size={24}
                  strokeWidth={1.5}
                  fill="white"
                  color="white"
                />
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
