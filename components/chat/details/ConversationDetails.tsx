import React from "react";
import { View, Text, Alert, Pressable } from "react-native";
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

interface ConversationDetailsProps {
  id: string;
}

export const ConversationDetails = ({ id }: ConversationDetailsProps) => {
  const conversationId = Number(id);
  const queryClient = useQueryClient();
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
    queryClient.setQueriesData({ queryKey: ["conversations"] }, (oldData) =>
      removeConversationFromPages(oldData as never, conversationId),
    );
  }, [conversationId, queryClient]);

  const handleConversationActionSuccess = React.useCallback(
    (message: string) => {
      removeConversationFromCache();
      toast.success(message);
      router.back();
    },
    [removeConversationFromCache],
  );

  const handleConversationActionError = React.useCallback(
    (title: string, error: ServerErrorResponse) => {
      toast.error(title, {
        description:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    },
    [],
  );

  const { mutate: deleteConversation, isPending: isDeletePending } =
    useMutation({
      mutationFn: () =>
        api.chat.conversation.deleteConversation(conversationId),
      onSuccess: () => handleConversationActionSuccess("Conversation deleted."),
      onError: (error: ServerErrorResponse) =>
        handleConversationActionError("Unable to delete conversation", error),
    });

  const { mutate: blockUser, isPending: isBlockPending } = useMutation({
    mutationFn: () => api.chat.conversation.blockUser(user!.id),
    onSuccess: () => handleConversationActionSuccess("User blocked."),
    onError: (error: ServerErrorResponse) =>
      handleConversationActionError("Unable to block user", error),
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

    Alert.alert(
      "Delete conversation",
      "Are you sure you want to delete this conversation? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteConversation(),
        },
      ],
    );
  };

  const handleBlockUser = () => {
    if (!user || isBlockPending) return;

    Alert.alert(
      "Block user",
      `Block ${identification}? They will no longer be able to message you.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => blockUser(),
        },
      ],
    );
  };

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
            Content actions
          </Text>
        </View>
        <View className="bg-card mx-4 rounded-2xl overflow-hidden">
          <ConversationDetailsRow
            icon={ImageIcon}
            label="View media, files, and links"
            onPress={() =>
              router.push({
                pathname: "/main/chat/conversation-resource-details",
                params: { id: conversationId },
              })
            }
          />
          <ConversationDetailsRow
            icon={Search}
            label="Search in conversation"
            onPress={() => setIsSearching(true)}
          />
        </View>

        <View className="px-4 pt-6 pb-2">
          <Text className="text-primary text-sm font-semibold uppercase tracking-wider">
            Privacy and support
          </Text>
        </View>

        <View className="bg-card mx-4 rounded-2xl mb-12">
          <ConversationDetailsRow
            icon={Ban}
            label="Block"
            onPress={handleBlockUser}
          />
          <ConversationDetailsRow
            icon={AlertTriangle}
            label="Report"
            onPress={handleReportConversation}
          />
          <ConversationDetailsRow
            icon={Trash2}
            label="Delete conversation"
            destructive
            onPress={handleDeleteConversation}
          />
        </View>
      </ScrollView>
    </StableSafeAreaView>
  );
};
