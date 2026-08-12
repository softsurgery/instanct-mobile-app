import React from "react";
import { View, Text, Pressable } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Image as ImageIcon,
  Search,
  Ban,
  AlertTriangle,
  Trash2,
} from "lucide-react-native";
import { router } from "expo-router";
import { toast } from "sonner-native";
import { api } from "~/api";
import { ResponseMessageDto, ServerErrorResponse } from "~/types";
import { StableSafeAreaView } from "../../shared/StableSafeAreaView";
import { ApplicationHeader } from "../../shared/AppHeader";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import {
  CONVERSATION_LIST_JOIN,
  navigateToConversationMessage,
  removeConversationFromPages,
} from "@/lib/chat";
import { ScrollView } from "react-native-gesture-handler";
import { ConversationDetailsRow } from "./ConversationDetailsRow";
import { useUserPresence } from "@/hooks/content/chat/useUserPresence";
import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
import { ConversationSearchOverlay } from "../conversation/search/ConversationSearchOverlay";
import { useChatContext } from "@/contexts/ChatContext";
import { useTranslation } from "react-i18next";
import { type ActionSheetRef } from "react-native-actions-sheet";
import { DeleteConversationActionSheet } from "./DeleteConversationActionSheet";
import { BlockUserActionSheet } from "./BlockUserActionSheet";

interface ConversationDetailsProps {
  id: string;
}

/**
 * Screen displaying settings, participant info, media/file galleries, and block/report/delete actions for a conversation.
 */
export const ConversationDetails = ({ id }: ConversationDetailsProps) => {
  const { t } = useTranslation("chat");
  const conversationId = Number(id);
  const queryClient = useQueryClient();
  const { resetCount } = useChatContext();
  const { currentUser } = useCurrentUser();

  const { data: conversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () =>
      api.chat.conversation.findById(conversationId, CONVERSATION_LIST_JOIN),
    enabled: Number.isFinite(conversationId) && conversationId > 0,
  });

  const user = React.useMemo(() => {
    if (!conversation || !currentUser) return null;
    return conversation.participants.find(
      (participant) => participant.userId !== currentUser.id,
    )?.user;
  }, [conversation, currentUser]);

  const identification = identifyUser(user);
  const { isOnline } = useUserPresence({ userId: user?.id });

  const [isSearching, setIsSearching] = React.useState(false);

  const blockSheetRef = React.useRef<ActionSheetRef>(null);
  const deleteSheetRef = React.useRef<ActionSheetRef>(null);

  const hideActionSheets = React.useCallback(() => {
    blockSheetRef.current?.hide();
    deleteSheetRef.current?.hide();
  }, []);

  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    className: "rounded-full",
    wrapperClassName: "rounded-full border border-border",
    fallbacks: [identifyUserAvatar(user)],
    size: { width: 70, height: 70 },
  });

  const profilePicture = profilePictures[0];

  const removeConversationFromCache = React.useCallback(() => {
    queryClient.removeQueries({ queryKey: ["conversation", conversationId] });
    queryClient.removeQueries({
      queryKey: ["conversation-messages", conversationId],
    });
    queryClient.setQueriesData({ queryKey: ["conversations"] }, (oldData) =>
      removeConversationFromPages(oldData as never, conversationId),
    );
  }, [conversationId, queryClient]);

  const handleConversationActionSuccess = React.useCallback(
    (message: string) => {
      hideActionSheets();
      removeConversationFromCache();
      resetCount();
      toast.success(message);
      router.dismissTo({ pathname: "/main/chat" });
    },
    [hideActionSheets, removeConversationFromCache, resetCount],
  );

  const handleConversationActionError = React.useCallback(
    (title: string, error: ServerErrorResponse) => {
      hideActionSheets();
      toast.error(title, {
        description:
          error.response?.data?.message || t("chat.details.errors.generic"),
      });
    },
    [hideActionSheets, t],
  );

  const { mutate: deleteConversation, isPending: isDeletePending } =
    useMutation({
      mutationFn: () =>
        api.chat.conversation.deleteConversation(conversationId),
      onSuccess: () =>
        handleConversationActionSuccess(
          t("chat.details.toasts.conversationDeleted"),
        ),
      onError: (error: ServerErrorResponse) =>
        handleConversationActionError(
          t("chat.details.errors.deleteFailed"),
          error,
        ),
    });

  const { mutate: blockUser, isPending: isBlockPending } = useMutation({
    mutationFn: () => api.chat.conversation.blockUser(user!.id),
    onSuccess: () =>
      handleConversationActionSuccess(t("chat.details.toasts.userBlocked")),
    onError: (error: ServerErrorResponse) =>
      handleConversationActionError(
        t("chat.details.errors.blockFailed"),
        error,
      ),
  });

  const handleSearchResultPress = React.useCallback(
    (message: ResponseMessageDto) => {
      setIsSearching(false);
      navigateToConversationMessage({
        conversationId,
        messageId: message.id,
        user,
      });
    },
    [conversationId, user],
  );

  const handleDeleteConversation = () => {
    if (isDeletePending) return;

    deleteSheetRef.current?.show();
  };

  const handleBlockUser = () => {
    if (!user || isBlockPending) return;

    blockSheetRef.current?.show();
  };

  /**
   * Navigates to the conversation reporting form screen.
   */
  const handleReportConversation = () => {
    router.push({
      pathname: "/main/chat/report-conversation",
      params: {
        id: String(conversationId),
        reportedUserName: identification,
      },
    });
  };

  if (isSearching) {
    return (
      <ConversationSearchOverlay
        conversationId={conversationId}
        onClose={() => setIsSearching(false)}
        onResultPress={handleSearchResultPress}
      />
    );
  }

  return (
    <StableSafeAreaView className="flex-1 bg-card">
      <ApplicationHeader
        title={identification}
        titleVariant="large"
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
        reverse
        classNames={{ wrapper: "border-b border-border pb-2 bg-card" }}
      />
      <ScrollView
        className="bg-background"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          className="flex flex-col items-center gap-4 m-4 p-4 rounded-xl"
          onPress={() => {
            router.push({
              pathname: "/main/profile/inspect-profile",
              params: { id: user?.id },
            });
          }}
        >
          <View className="relative">
            {profilePicture}
            {isOnline && (
              <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-card rounded-full" />
            )}
          </View>
          <View>
            <Text className="text-foreground text-xl font-bold text-center">
              {identification}
            </Text>
            <Text className="text-foreground text-sm text-center">
              @{user?.username}
            </Text>
          </View>
        </Pressable>

        <View className="px-4 pb-2">
          <Text className="text-primary text-sm font-semibold uppercase tracking-wider">
            {t("chat.details.sections.contentActions")}
          </Text>
        </View>
        <View className="bg-card mx-4 rounded-2xl overflow-hidden">
          <ConversationDetailsRow
            icon={ImageIcon}
            label={t("chat.details.rows.viewResources")}
            onPress={() =>
              router.push({
                pathname: "/main/chat/conversation-resource-details",
                params: { id: conversationId },
              })
            }
          />
          <ConversationDetailsRow
            icon={Search}
            label={t("chat.details.rows.search")}
            onPress={() => setIsSearching(true)}
          />
        </View>

        <View className="px-4 pt-6 pb-2">
          <Text className="text-primary text-sm font-semibold uppercase tracking-wider">
            {t("chat.details.sections.privacySupport")}
          </Text>
        </View>

        <View className="bg-card mx-4 rounded-2xl mb-12">
          <ConversationDetailsRow
            icon={Ban}
            label={t("chat.details.rows.block")}
            onPress={handleBlockUser}
          />
          <ConversationDetailsRow
            icon={AlertTriangle}
            label={t("chat.details.rows.report")}
            onPress={handleReportConversation}
          />
          <ConversationDetailsRow
            icon={Trash2}
            label={t("chat.details.rows.delete")}
            destructive
            onPress={handleDeleteConversation}
          />
        </View>
      </ScrollView>

      <BlockUserActionSheet
        ref={blockSheetRef}
        identification={identification}
        onConfirm={() => blockUser()}
        onClose={() => blockSheetRef.current?.hide()}
        isPending={isBlockPending}
      />

      <DeleteConversationActionSheet
        ref={deleteSheetRef}
        onConfirm={() => deleteConversation()}
        onClose={() => deleteSheetRef.current?.hide()}
        isPending={isDeletePending}
      />
    </StableSafeAreaView>
  );
};
