import { api } from "@/api";
import { prependConversationToPages } from "@/lib/chat";
import { CreateConversationDto, ResponseConversationDto } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface useStartConversationProps {
  onSuccess?: (conversation: ResponseConversationDto) => void;
}

/**
 * Hook providing a mutation to start or create a new conversation with a list of user IDs.
 */
export const useStartConversation = ({
  onSuccess,
}: useStartConversationProps = {}) => {
  const queryClient = useQueryClient();

  const { mutate: startConversation, isPending: isStartingConversation } =
    useMutation({
      mutationKey: ["start-conversation"],
      mutationFn: (createConverstationDto: CreateConversationDto) =>
        api.chat.conversation.createConversation(createConverstationDto),
      onSuccess: (conversation) => {
        queryClient.setQueriesData(
          { queryKey: ["conversations"], exact: false },
          (oldData) => prependConversationToPages(oldData as any, conversation),
        );
        onSuccess?.(conversation);
      },
    });

  return { startConversation, isStartingConversation };
};
