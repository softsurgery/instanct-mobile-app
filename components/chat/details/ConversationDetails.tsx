import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  useColorScheme,
  Pressable,
} from "react-native";
import { LegendList } from "@legendapp/list";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Type,
  Image as ImageIcon,
  Download,
  Search,
  Slash,
  Ban,
  AlertTriangle,
  Trash2,
  X,
  ArrowLeft,
} from "lucide-react-native";
import { Icon } from "~/components/ui/icon";

import { router } from "expo-router";
import axios from "~/api/axios";
import { api } from "~/api";
import { message as messageApi } from "~/api/chat/message";
import { ResponseMessageDto } from "~/types";
import { StableSafeAreaView } from "../../shared/StableSafeAreaView";
import { ApplicationHeader } from "../../shared/AppHeader";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { ScrollView } from "react-native-gesture-handler";
import { ConversationDetailsRow } from "./ConversationDetailsRow";
import { useColorPalette } from "@/hooks/useColorPalette";
import { hslToHex } from "@/lib/theme";
import { useUserPresence } from "@/hooks/content/chat/useUserPresence";

interface MessageResultItemProps {
  message: ResponseMessageDto;
  searchQuery: string;
  onPress: () => void;
}
const MessageResultItem = ({
  message,
  searchQuery,
  onPress,
}: MessageResultItemProps) => {
  const highlightText = (text: string, query: string) => {
    if (!text || !query.trim())
      return <Text className="text-foreground">{text || ""}</Text>;

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return (
      <Text className="text-foreground">
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <Text key={index} className="bg-accent font-semibold">
              {part}
            </Text>
          ) : (
            <Text key={index}>{part}</Text>
          ),
        )}
      </Text>
    );
  };

  const senderName = identifyUser(message.user);
  const content = message.content || "";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="px-4 py-3 border-b border-border active:bg-muted/30"
    >
      <View className="flex-row items-start">
        <View className="w-8 h-8 rounded-full bg-muted items-center justify-center mr-3 mt-1">
          <Text className="text-muted-foreground text-xs font-medium">
            {senderName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-foreground font-medium mr-2">
              {senderName}
            </Text>
            <Text className="text-muted-foreground text-xs">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          {highlightText(content, searchQuery)}
          <Text className="text-muted-foreground text-xs mt-2">
            {new Date(message.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface ConversationDetailsProps {
  id: string;
}

export const ConversationDetails = ({ id }: ConversationDetailsProps) => {
  const { palette } = useColorPalette();
  const conversationId = Number(id);
  const { currentUser } = useCurrentUser();

  const { data: conversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () =>
      api.chat.conversation.findById(
        conversationId,
        ["participants", "participants.user", "lastMessage"].join(","),
      ),
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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<
    ResponseMessageDto[]
  >([]);
  const [loadingSearch, setLoadingSearch] = React.useState(false);
  const searchInputRef = React.useRef<TextInput>(null);

  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    className: "rounded-full",
    wrapperClassName: "rounded-full border border-border",
    fallbacks: [identifyUserAvatar(user)],
    size: { width: 150, height: 150 },
    enabled: !!user,
  });
  const profilePicture = profilePictures[0];

  const [nickname, setNickname] = React.useState(identification);
  const [messages, setMessages] = React.useState<ResponseMessageDto[]>([]);
  const [autoSavePhotos, setAutoSavePhotos] = React.useState(false);

  React.useEffect(() => {
    setNickname(identification);
  }, [identification]);

  React.useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!Number.isFinite(conversationId) || conversationId <= 0) {
          setMessages([]);
          return;
        }

        const response = await messageApi.findPaginatedConversationMessages(
          conversationId,
          {
            page: "1",
            limit: "100",
            sort: "DESC",
          },
        );
        setMessages(response.data || []);
      } catch {
        setMessages([]);
      }
    };

    fetchMessages();
  }, [conversationId]);

  const handleSearch = React.useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      setLoadingSearch(true);

      const results = messages
        .filter((msg) =>
          msg.content?.toLowerCase().includes(query.toLowerCase()),
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      setSearchResults(results);
      setLoadingSearch(false);
    },
    [messages],
  );

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isSearching) handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isSearching, handleSearch]);

  const handleResultPress = (message: ResponseMessageDto) => {
    setIsSearching(false);
    setSearchQuery("");
    Alert.alert(
      "Navigate",
      `Go to message: ${message.content.substring(0, 50)}...`,
    );
  };

  const handleDeleteConversation = () => {
    Alert.alert(
      "Delete conversation",
      "Are you sure you want to delete this conversation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`/conversation/${conversationId}`);
              Alert.alert("Success", "Conversation deleted.");
              router.back();
            } catch (error) {
              console.error("Erreur lors de la suppression :", error);
              Alert.alert("Error", "Unable to delete conversation.");
            }
          },
        },
      ],
    );
  };

  // ------------------- MODE RECHERCHE -------------------
  if (isSearching) {
    return (
      <StableSafeAreaView className="flex-1 bg-background">
        <ApplicationHeader
          title=""
          shortcuts={[
            {
              key: "back",
              icon: ArrowLeft,
              onPress: () => router.back(),
            },
          ]}
          reverse
          classNames={{ wrapper: "border-b border-border pb-2 bg-transparent" }}
        />
        <View className="pt-12 px-3 pb-3 border-b border-border bg-background">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => {
                setIsSearching(false);
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="p-2 rounded-full"
            >
              <Icon
                as={ArrowLeft}
                size={22}
                color={hslToHex(palette.foreground)}
              />
            </TouchableOpacity>
            <View className="flex-1 flex-row items-center bg-muted rounded-full px-4 py-2.5">
              <Icon as={Search} size={18} color={hslToHex(palette.muted)} />
              <TextInput
                ref={searchInputRef}
                className="flex-1 text-foreground ml-3 text-base"
                placeholder="Search in conversation"
                placeholderTextColor={hslToHex(palette.muted)}
                value={searchQuery}
                autoFocus
                selectionColor={hslToHex(palette.accent)}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  className="p-1"
                >
                  <Icon as={X} size={18} color={hslToHex(palette.muted)} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <LegendList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }: { item: ResponseMessageDto }) => (
            <MessageResultItem
              message={item}
              searchQuery={searchQuery}
              onPress={() => handleResultPress(item)}
            />
          )}
          ListHeaderComponent={() => (
            <View className="px-4 py-3 border-b border-border">
              <Text className="text-muted-foreground text-sm">
                {loadingSearch
                  ? "Searching..."
                  : `${searchResults.length} result${
                      searchResults.length !== 1 ? "s" : ""
                    }`}
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-20">
              {loadingSearch ? (
                <Text className="text-muted-foreground">Searching...</Text>
              ) : searchQuery ? (
                <>
                  <Icon as={Search} size={60} color={hslToHex(palette.muted)} />
                  <Text className="text-muted-foreground text-lg mt-4 font-medium">
                    {`No results for "${searchQuery}"`}
                  </Text>
                  <Text className="text-muted-foreground text-center mt-2 px-10">
                    {"Check spelling or try different keywords"}
                  </Text>
                </>
              ) : (
                <Text className="text-muted-foreground">
                  Enter a keyword to search in this conversation
                </Text>
              )}
            </View>
          )}
          keyboardShouldPersistTaps="handled"
        />
      </StableSafeAreaView>
    );
  }

  return (
    <StableSafeAreaView className="flex-1 bg-card">
      <ApplicationHeader
        title="Conversation details"
        titleVariant="large"
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => router.back(),
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
          className="flex flex-col items-center gap-4 m-4 pt-4 px-4 rounded-xl"
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
              <View className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-2 border-card rounded-full" />
            )}
          </View>
          <Text className="text-foreground text-xl font-bold">{nickname}</Text>
        </Pressable>

        <View className="px-4 pt-6 pb-2">
          <Text className="text-primary text-sm font-semibold uppercase tracking-wider">
            Customization
          </Text>
        </View>
        <View className="bg-card mx-4 rounded-2xl overflow-hidden">
          <ConversationDetailsRow
            icon={Type}
            label="Nicknames"
            value={nickname}
            onPress={() =>
              Alert.prompt(
                "Nickname",
                "Set a local nickname for this conversation",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Save",
                    onPress: (value?: string) => {
                      const nextNickname = value?.trim();
                      if (nextNickname) setNickname(nextNickname);
                    },
                  },
                ],
                "plain-text",
                nickname,
              )
            }
          />
        </View>

        <View className="px-4 pt-6 pb-2">
          <Text className="text-primary text-sm font-semibold uppercase tracking-wider">
            Other actions
          </Text>
        </View>
        <View className="bg-card mx-4 rounded-2xl overflow-hidden">
          <ConversationDetailsRow
            icon={ImageIcon}
            label="View media, files, and links"
            onPress={() =>
              Alert.alert(
                "Coming soon",
                "Media viewer will be added in a dedicated screen.",
              )
            }
          />
          <View className="h-[0.5px] bg-border ml-16" />
          <ConversationDetailsRow
            icon={Download}
            label="Save photos automatically"
            toggleValue={autoSavePhotos}
            onToggle={setAutoSavePhotos}
            showChevron={false}
          />
          <ConversationDetailsRow
            icon={Search}
            label="Search in conversation"
            onPress={() => setIsSearching(true)}
          />
          <View className="h-[0.5px] bg-border ml-16" />
          <ConversationDetailsRow
            icon={Bell}
            label="Sounds and notifications"
            onPress={() =>
              Alert.alert(
                "Sounds and notifications",
                "Detailed settings coming soon.",
              )
            }
          />
        </View>

        <View className="px-4 pt-6 pb-2">
          <Text className="text-primary text-sm font-semibold uppercase tracking-wider">
            Privacy and support
          </Text>
        </View>

        <View className="bg-card mx-4 rounded-2xl mb-12 overflow-hidden">
          <ConversationDetailsRow icon={Slash} label="Restrict" />
          <View className="h-[0.5px] bg-border ml-16" />
          <ConversationDetailsRow icon={Ban} label="Block" />
          <View className="h-[0.5px] bg-border ml-16" />
          <ConversationDetailsRow icon={AlertTriangle} label="Report" />
          <View className="h-[0.5px] bg-border ml-16" />
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
