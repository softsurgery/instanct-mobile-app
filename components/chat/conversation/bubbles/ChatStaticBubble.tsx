import { cn } from "@/lib/utils";
import { ResponseMessageDto, StaticMessageEnum } from "@/types";
import React from "react";
import { Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useTranslation } from "react-i18next";

interface ChatStaticBubbleProps {
  message: ResponseMessageDto;
  className?: string;
}
/**
 * Centered notification pill rendering system/static events (e.g., start of conversation or poke notifications).
 */
export const ChatStaticBubble = ({
  className,
  message,
}: ChatStaticBubbleProps) => {
  const { t } = useTranslation("chat");
  const { currentUser } = useCurrentUser();

  const content = React.useMemo(() => {
    if (message.static) {
      switch (message.static) {
        case StaticMessageEnum.FIRST_MESSAGE:
          return t("chat.conversation.static.firstMessage");
        case StaticMessageEnum.POKE:
          return message.userId === currentUser?.id
            ? t("chat.conversation.static.pokeSent")
            : t("chat.conversation.static.pokeReceived");
        default:
          return message.content;
      }
    }
    return message.content;
  }, [message, currentUser?.id, t]);
  return (
    <Pressable
      className={cn("max-w-[80%] mx-auto rounded-2xl my-2", className)}
    >
      <Text className="text-center text-sm">{content}</Text>
    </Pressable>
  );
};
