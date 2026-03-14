import { api } from "@/api";
import { CreateConversationDto } from "@/types";
import { useMutation } from "@tanstack/react-query";

interface useStartConversationProps {
  onSuccess: (...args: any[]) => void;
}

export const useStartConversation = (
  { onSuccess }: useStartConversationProps = {
    onSuccess: () => {},
  },
) => {
  const { mutate: startConversation, isPending: isStartingConversation } =
    useMutation({
      mutationKey: ["start-conversation"],
      mutationFn: (createConverstationDto: CreateConversationDto) =>
        api.chat.conversation.createConversation(createConverstationDto),
      onSuccess,
    });

  return { startConversation, isStartingConversation };
};
