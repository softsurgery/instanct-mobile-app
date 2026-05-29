import { Plus, SendHorizonal } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StablePressable } from "~/components/shared/StablePressable";
import { Icon } from "~/components/ui/icon";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { useKeyboardVisible } from "~/hooks/useKeyboardVisible";

interface ConversationInputProps {
  className?: string;
  input: string;
  setInput: (text: string) => void;
  sendMessage: () => void;
}

export const ConversationInput = ({
  className,
  input,
  setInput,
  sendMessage,
}: ConversationInputProps) => {
  const insets = useSafeAreaInsets();
  const isKeyboardVisible = useKeyboardVisible();

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage();
  };

  return (
    <View
      className={cn("bg-background/95 border-t border-border", className)}
      style={{
        zIndex: 20,
        elevation: 10,
        paddingBottom: isKeyboardVisible ? 4 : Math.max(insets.bottom, 8),
      }}
    >
      <View className="flex flex-row items-end gap-2 px-3 py-2">
        {/* Add Button */}
        <StablePressable
          className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full mb-0.5"
          onPress={() => {}}
          accessibilityLabel="Add attachment"
        >
          <Icon as={Plus} size={20} />
        </StablePressable>

        {/* Text Input */}
        <Textarea
          value={input}
          onChangeText={setInput}
          placeholder="Aa"
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
  );
};
