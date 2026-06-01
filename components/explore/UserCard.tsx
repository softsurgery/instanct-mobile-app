import React from "react";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { hslToHex } from "@/lib/theme";
import { cn } from "@/lib/utils";
import {
  ResponseConversationDto,
  ResponseRefParamDto,
  ResponseUserDto,
} from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  MessageCircle,
  Bookmark,
  Briefcase,
  Quote,
  Goal,
} from "lucide-react-native";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { ImageBackground } from "expo-image";
import { useStartConversation } from "@/hooks/content/chat/useStartConversation";
import { useBookmarkActions } from "@/hooks/content/users/useBookmarkActions";
import { useServerImages } from "@/hooks/content/useServerImages";
import StableScrollView from "../shared/StableScrollView";
import { useColorPalette } from "@/hooks/useColorPalette";
import { IconMoodPlus } from "@tabler/icons-react-native";

const { width, height: screenHeight } = Dimensions.get("window");

const CARD_HEIGHT = screenHeight * 0.9;
const HERO_HEIGHT = CARD_HEIGHT * 0.5;

interface UserCardProps {
  className?: string;
  user: ResponseUserDto;
  objectives: ResponseRefParamDto[];
  // industries: ResponseRefParamDto[];
}

export const UserCard = ({
  user,
  objectives,
  // industries,
  className,
}: UserCardProps) => {
  const { palette } = useColorPalette();
  const primary = hslToHex(palette?.primary);
  const primaryDark = hslToHex(palette?.primary, 0.8);
  const router = useRouter();
  const { isBookmarked, toggleBookmark } = useBookmarkActions({
    bookmarkId: user.id,
  });

  const identity = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { uploads: uploadedProfilePicture } = useServerImages({
    ids: [user?.pictureId],
    fallbacks: [fallback],
    size: { width: 100, height: 100 },
  });

  const photoUri = uploadedProfilePicture[0] as string | undefined;

  const { startConversation } = useStartConversation({
    onSuccess: (conversation: ResponseConversationDto) => {
      router.push({
        pathname: "/main/chat/conversation",
        params: { id: conversation.id },
      });
    },
  });

  const openProfile = () =>
    router.push({
      pathname: "/main/profile/inspect-profile",
      params: { id: user?.id },
    });

  const heroOverlay = (
    <View
      className="flex-1 justify-end px-5"
      style={{ paddingBottom: 30 }}
      pointerEvents="box-none"
    >
      <Pressable onPress={openProfile} className="gap-1">
        <Text className="text-3xl font-extrabold text-white" numberOfLines={1}>
          {identity}
        </Text>
        <Text className="text-sm font-semibold text-white/70">
          @{user.username}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View
      className={cn("flex-1 bg-background", className)}
      style={{ width, height: CARD_HEIGHT }}
    >
      {/* Hero — the person */}
      <View style={{ height: HERO_HEIGHT, width: "100%" }}>
        {photoUri ? (
          <ImageBackground
            source={{ uri: photoUri }}
            style={{ flex: 1 }}
            contentFit="cover"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.45)", "transparent"]}
              style={[styles.scrim, { height: 120 }]}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.85)"]}
              style={StyleSheet.absoluteFill}
            />
            {heroOverlay}
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={[primary, primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          >
            <View
              style={StyleSheet.absoluteFill}
              className="items-center justify-center"
            >
              <Text className="text-[120px] font-black text-white/15">
                {fallback}
              </Text>
            </View>
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.35)"]}
              style={StyleSheet.absoluteFill}
            />
            {heroOverlay}
          </LinearGradient>
        )}
      </View>

      {/* Content sheet — overlaps the hero for depth */}
      <View className="flex-1 rounded-t-3xl bg-background">
        {/* Floating action bar straddling the seam */}
        <View
          className="flex-row items-center justify-center gap-5"
          style={{ marginTop: -32 }}
        >
          {/* Bookmark */}
          <Pressable
            onPress={toggleBookmark}
            className={cn(
              "h-14 w-14 items-center justify-center rounded-full border shadow-lg shadow-black/20",
              isBookmarked
                ? "border-transparent bg-primary active:bg-primary/50"
                : "border-border bg-card active:bg-card/50",
            )}
          >
            <Icon
              as={Bookmark}
              size={24}
              color={isBookmarked ? "#ffffff" : primary}
              fill={isBookmarked ? "#ffffff" : "transparent"}
            />
          </Pressable>

          {/* Send request — the headline action */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/main/request/new-request",
                params: { id: user?.id },
              })
            }
            className="rounded-full bg-primary active:bg-primary/50 border-2 border-border w-20 h-20 flex items-center justify-center"
          >
            <Icon
              as={IconMoodPlus}
              strokeWidth={1.5}
              size={42}
              color={"white"}
              // fill="white"
            />
          </Pressable>

          {/* Message */}
          <Pressable
            onPress={() => startConversation({ users: [user.id] })}
            className="h-14 w-14 items-center justify-center rounded-full border border-border bg-card active:bg-card/50 shadow-lg shadow-black/20"
          >
            <Icon as={MessageCircle} size={24} color={primary} />
          </Pressable>
        </View>

        <StableScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          {/* Industries */}
          {user.industries && user.industries.length > 0 && (
            <View className="mb-6">
              <View className="mb-2.5 flex-row items-center gap-2">
                <Icon as={Briefcase} size={16} color={primary} />
                <Text className="text-base font-bold text-foreground">
                  Industries
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {user.industries.map((ind) => (
                  <View
                    key={ind.id}
                    className="rounded-full bg-muted px-3 py-1.5"
                  >
                    <Text className="text-[13px] font-semibold text-foreground">
                      {ind.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Objectives */}

          {user?.activeSession?.payload?.objectives &&
            user.activeSession.payload.objectives.length > 0 && (
              <View className="mb-6">
                <View className="mb-2.5 flex-row items-center gap-2">
                  <Icon as={Goal} size={16} color={primary} />
                  <Text className="text-base font-bold text-foreground">
                    Objectives
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {user.activeSession.payload.objectives.map((id) => {
                    const objective = objectives.find((obj) => obj.id == id);
                    if (!objective) return null;
                    return (
                      <View
                        key={objective.id}
                        className="rounded-full bg-muted px-3 py-1.5"
                      >
                        <Text className="text-[13px] font-semibold text-foreground">
                          {objective.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

          {/* Bio */}
          <View>
            <View className="mb-2.5 flex-row items-center gap-2">
              <Icon as={Quote} size={16} color={primary} />
              <Text className="text-base font-bold text-foreground">About</Text>
            </View>
            <Text className="text-[15px] leading-6 text-muted-foreground">
              {user.bio?.trim() || "No bio available."}
            </Text>
            {/* <Text className="text-[15px] leading-6 text-muted-foreground">
              {JSON.stringify(user.activeSession)}
            </Text> */}
          </View>
        </StableScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
