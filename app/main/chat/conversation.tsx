import { Conversation } from "@/components/chat/Conversation";
import { useLocalSearchParams } from "expo-router";

export default function Screen() {
  const { id, userId, identifier, pictureId, avatarFallback, messageId } =
    useLocalSearchParams<{
      id: string;
      userId?: string;
      identifier?: string;
      pictureId?: string;
      avatarFallback?: string;
      messageId?: string;
    }>();

  return (
    <Conversation
      id={Number(id)}
      userId={userId}
      identifier={identifier}
      pictureId={pictureId}
      avatarFallback={avatarFallback}
      scrollToMessageId={
        messageId && Number.isFinite(Number(messageId))
          ? Number(messageId)
          : undefined
      }
    />
  );
}
