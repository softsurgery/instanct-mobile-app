import { cn } from "@/lib/utils";
import { ResponseMessageDto, StaticMessageEnum } from "@/types";
import React from "react";
import { Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";

interface ChatStaticBubbleProps {
  message: ResponseMessageDto;
  className?: string;
}
export const ChatStaticBubble = ({
  className,
  message,
}: ChatStaticBubbleProps) => {
  const { currentUser } = useCurrentUser();

  const content = React.useMemo(() => {
    if (message.static) {
      switch (message.static) {
        case StaticMessageEnum.FIRST_MESSAGE:
          return "This is the start of the conversation";
        case StaticMessageEnum.POKE:
          return message.userId === currentUser?.id
            ? "You sent a poke"
            : "You received a poke";
        default:
          return message.content;
      }
    }
    return message.content;
  }, [message, currentUser?.id]);
  return (
    <Pressable
      className={cn("max-w-[80%] mx-auto rounded-2xl my-2", className)}
    >
      <Text className="text-center text-sm">{content}</Text>
    </Pressable>
  );
};
