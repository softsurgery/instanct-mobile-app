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
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { useStartConversation } from "@/hooks/content/chat/useStartConversation";
import { useBookmarkActions } from "@/hooks/content/users/useBookmarkActions";
import { useServerImages } from "@/hooks/content/useServerImages";
import { useColorPalette } from "@/hooks/useColorPalette";
import { IconMoodPlus } from "@tabler/icons-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { ScrollView } from "react-native-gesture-handler";
import { ImageBackground } from "expo-image";
const { width, height: screenHeight } = Dimensions.get("window");

const CARD_HEIGHT = screenHeight;
const HERO_HEIGHT = CARD_HEIGHT * 0.5;

interface UserCardProps {
  className?: string;
  user: ResponseUserDto;
  objectives: ResponseRefParamDto[];
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  // industries: ResponseRefParamDto[];
}

export const UserCard = ({
  user,
  objectives,
  onScroll,
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

  const photoUri = uploadedProfilePicture[0]?.uri as string | undefined;

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

  // Reanimated button states
  const bookmarkScale = useSharedValue(1);
  const requestScale = useSharedValue(1);
  const messageScale = useSharedValue(1);

  const bookmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  const requestStyle = useAnimatedStyle(() => ({
    transform: [{ scale: requestScale.value }],
  }));

  const messageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: messageScale.value }],
  }));

  // Pulsing animation for the main action button
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.35, { duration: 1600 }),
      -1,
      false,
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 1600 }),
      -1,
      false,
    );
  }, [pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const heroOverlay = (
    <View
      className="flex-1 justify-end px-5"
      style={{ paddingBottom: 30 }}
      pointerEvents="box-none"
    >
      <Pressable onPress={openProfile} className="gap-1.5">
        <Text
          className="text-3xl font-extrabold text-white tracking-tight"
          numberOfLines={1}
        >
          {identity}
        </Text>
        <Text className="text-sm font-semibold text-white/70 tracking-wide">
          @{user.username}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView
      className={cn("flex-1 bg-background", className)}
      style={{ width, height: CARD_HEIGHT }}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
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
              colors={["rgba(0,0,0,0.5)", "transparent"]}
              style={[styles.scrim, { height: 120 }]}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]}
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
            {/* Elegant glassmorphic default user layout */}
            <View
              style={StyleSheet.absoluteFill}
              className="items-center justify-center"
            >
              {/* Floating decorative glass elements for background depth */}
              <View className="absolute top-10 left-10 w-24 h-24 rounded-full bg-white/5 border border-white/10" />
              <View className="absolute bottom-16 right-12 w-32 h-32 rounded-full bg-white/5 border border-white/10" />

              {/* Main Avatar Badge */}
              <View className="w-28 h-28 rounded-full items-center justify-center bg-white/10 border border-white/20 shadow-2xl">
                <Text className="text-4xl font-extrabold text-white tracking-widest uppercase">
                  {fallback}
                </Text>
              </View>
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
      <View className="flex-1 rounded-t-3xl bg-background border-t border-border/10">
        {/* Floating action bar straddling the seam */}
        <View
          className="flex-row items-center justify-center gap-5"
          style={{ marginTop: -36 }}
        >
          {/* Bookmark */}
          <Animated.View style={bookmarkStyle}>
            <Pressable
              onPressIn={() => {
                // eslint-disable-next-line react-hooks/immutability
                bookmarkScale.value = withSpring(0.85, {
                  damping: 12,
                  stiffness: 250,
                });
              }}
              onPressOut={() => {
                // eslint-disable-next-line react-hooks/immutability
                bookmarkScale.value = withSpring(1, {
                  damping: 12,
                  stiffness: 250,
                });
              }}
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
          </Animated.View>

          {/* Send request — the headline action with pulsing aura */}
          <View className="relative items-center justify-center">
            <Animated.View
              style={[
                pulseStyle,
                {
                  position: "absolute",
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: primary,
                },
              ]}
            />
            <Animated.View style={requestStyle}>
              <Pressable
                onPressIn={() => {
                  // eslint-disable-next-line react-hooks/immutability
                  requestScale.value = withSpring(0.85, {
                    damping: 12,
                    stiffness: 250,
                  });
                }}
                onPressOut={() => {
                  // eslint-disable-next-line react-hooks/immutability
                  requestScale.value = withSpring(1, {
                    damping: 12,
                    stiffness: 250,
                  });
                }}
                onPress={() =>
                  router.push({
                    pathname: "/main/request/new-request",
                    params: { id: user?.id },
                  })
                }
                className="rounded-full bg-primary active:bg-primary/50 border border-white/20 w-20 h-20 flex items-center justify-center shadow-xl shadow-primary/30"
              >
                <Icon
                  as={IconMoodPlus}
                  strokeWidth={1.5}
                  size={40}
                  color={"white"}
                />
              </Pressable>
            </Animated.View>
          </View>

          {/* Message */}
          <Animated.View style={messageStyle}>
            <Pressable
              onPressIn={() => {
                // eslint-disable-next-line react-hooks/immutability
                messageScale.value = withSpring(0.85, {
                  damping: 12,
                  stiffness: 250,
                });
              }}
              onPressOut={() => {
                // eslint-disable-next-line react-hooks/immutability
                messageScale.value = withSpring(1, {
                  damping: 12,
                  stiffness: 250,
                });
              }}
              onPress={() => startConversation({ users: [user.id] })}
              className="h-14 w-14 items-center justify-center rounded-full border border-border bg-card active:bg-card/50 shadow-lg shadow-black/20"
            >
              <Icon as={MessageCircle} size={24} color={primary} />
            </Pressable>
          </Animated.View>
        </View>

        <View className="flex-1 px-5 mt-4 pb-36">
          {/* Industries */}
          {user.industries && user.industries.length > 0 && (
            <View className="mb-6">
              <View className="mb-2.5 flex-row items-center gap-2">
                <Icon as={Briefcase} size={15} color={primary} />
                <Text className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                  Industries
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {user.industries.map((ind) => (
                  <View
                    key={ind.id}
                    className="rounded-full border border-border/30 px-3 py-1 flex-row items-center gap-1.5"
                  >
                    <View className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
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
                  <Icon as={Goal} size={15} color={primary} />
                  <Text className="text-sm font-extrabold text-foreground uppercase tracking-wider">
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
                        className="rounded-full bg-muted/40 border border-muted-foreground/10 px-3 py-1 flex-row items-center gap-1.5"
                      >
                        <View className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
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
          <View className="mb-8">
            <View className="mb-2.5 flex-row items-center gap-2">
              <Icon as={Quote} size={15} color={primary} />
              <Text className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                About
              </Text>
            </View>
            <View className="bg-card/40 rounded-2xl p-4 border border-border/30">
              <Text className="text-[14px] leading-6 text-foreground/80">
                {user.bio?.trim() || "No bio available."}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
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
