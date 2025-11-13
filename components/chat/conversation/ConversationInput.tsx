import { Plus, SendHorizonal } from "lucide-react-native";
import { View } from "react-native";
import { StablePressable } from "~/components/shared/StablePressable";
import { Icon } from "~/components/ui/icon";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

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
  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage();
  };

  return (
    <View
      className={cn(
        "absolute bottom-4 left-4 right-4 flex flex-row items-end justify-between",
        className
      )}
      style={{
        zIndex: 20,
        elevation: 10, // Android floating shadow
      }}
    >
      <View
        className="flex flex-row items-end justify-between bg-background px-3 py-3 rounded-2xl shadow-md flex-1 border border-border"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        {/* Add Button */}
        <StablePressable
          className="w-10 h-10 flex items-center justify-center bg-primary/20 rounded-lg"
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
          style={{ minHeight: 42, maxHeight: 120 }}
          className="flex-1 mx-2 px-2 py-2 rounded-xl bg-input text-base"
        />

        {/* Send Button */}
        <StablePressable
          className="w-10 h-10 flex items-center justify-center rounded-lg"
          onPress={handleSend}
          disabled={!input.trim()}
          accessibilityLabel="Send message"
        >
          <Icon
            as={SendHorizonal}
            size={20}
            color={input.trim() ? "#fff" : "#999"}
          />
        </StablePressable>
      </View>
    </View>
  );
};
