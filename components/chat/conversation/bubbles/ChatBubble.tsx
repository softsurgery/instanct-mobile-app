import { ResponseMessageLinkDto, StaticMessageEnum } from "@/types";
import { format } from "date-fns";
import { Alert, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { MessageTextContent } from "./MessageTextContent";
import { useTranslation } from "react-i18next";

interface ChatBubbleProps {
  message?: string;
  links?: ResponseMessageLinkDto[];
  timestamp: Date;
  right?: boolean;
  isPending?: boolean;
  static?: boolean;
  staticVariant?: StaticMessageEnum;
}

/**
 * Message bubble container handling directional layout (right/outgoing vs left/incoming),
 * gesture animations, timestamp display, and text/link parsing.
 */
export const ChatBubble = ({
  message,
  links,
  timestamp,
  right,
  isPending,
}: ChatBubbleProps) => {
  const { t } = useTranslation("chat");
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  /**
   * Invoked on long press gesture to open message interaction options dialog.
   */
  const handleLongPress = () => {
    Alert.alert(t("chat.conversation.messageOptions.title"), message || "", [
      {
        text: t("chat.conversation.messageOptions.copy"),
        onPress: () => console.log("Copy"),
      },
      {
        text: t("chat.conversation.messageOptions.delete"),
        onPress: () => console.log("Delete"),
      },
      { text: t("chat.conversation.messageOptions.cancel"), style: "cancel" },
    ]);
  };

  const longPressGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      // eslint-disable-next-line react-hooks/immutability
      scale.value = withSpring(1.05);
    })
    .onEnd((e, success) => {
      // eslint-disable-next-line react-hooks/immutability
      scale.value = withSpring(1);
      if (success) {
        runOnJS(handleLongPress)();
      }
    });

  const textClassName = cn(
    "text-[15px] leading-5",
    right ? "text-primary-foreground" : "text-secondary-foreground",
  );

  const linkClassName = cn(
    right ? "text-primary-foreground" : "text-primary",
    "font-medium",
  );

  return (
    <GestureDetector gesture={longPressGesture}>
      <Animated.View
        style={[animatedStyle, isPending && { opacity: 0.5 }]}
        className={cn(
          "max-w-[80%] mx-3 rounded-2xl mt-1.5",
          right
            ? "self-end rounded-br-sm bg-primary"
            : "self-start rounded-bl-sm bg-secondary",
        )}
      >
        <Pressable className="px-3 py-2 active:opacity-80">
          <MessageTextContent
            content={message}
            links={links}
            className={textClassName}
            linkClassName={linkClassName}
          />
          <Text
            className={cn(
              "text-[10px] text-right mt-1",
              right
                ? "text-primary-foreground/70"
                : "text-secondary-foreground/60",
            )}
          >
            {format(timestamp, "hh:mm a")}
          </Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};
