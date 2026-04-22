import { Button } from "@/components/ui/button";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { ResponseConversationDto, ResponseUserDto } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MessageCircle, Bookmark, BellRing } from "lucide-react-native";
import React from "react";
import { Dimensions, View } from "react-native";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { ImageBackground } from "expo-image";
import { StablePressable } from "../shared/StablePressable";
import { Badge } from "../ui/badge";
import { useStartConversation } from "@/hooks/content/chat/useStartConversation";
import { useBookmarkActions } from "@/hooks/content/users/useBookmarkActions";
import { useServerImages } from "@/hooks/content/useServerImages";

const { width } = Dimensions.get("window");

interface UserCardProps {
  className?: string;
  user: ResponseUserDto;
}

export const UserCard = ({ user, className }: UserCardProps) => {
  const {
    bookmark,
    isBookmarkPending,
    saveBookmark,
    isSavingBookmark,
    deleteBookmark,
    isDeletingBookmark,
  } = useBookmarkActions({ bookmarkId: user.id });

  const isBookmarked = !!bookmark;

  const identity = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsxArray: profilePictures, uploads: uploadedProfilePicture } =
    useServerImages({
      ids: [user?.pictureId],
      fallbacks: [fallback],
      wrapperClassName: "border-4 border-white bg-white rounded-full shadow-lg",
      size: { width: 100, height: 100 },
    });

  const router = useRouter();

  const { startConversation, isStartingConversation } = useStartConversation({
    onSuccess: (conversation: ResponseConversationDto) => {
      router.push({
        pathname: "/main/chat/conversation",
        params: { id: conversation.id },
      });
    },
  });

  return (
    <View
      className={cn("flex-1 min-h-full", className)}
      style={{ width: width }}
    >
      <View className="flex-1 bg-background mx-4 my-2 rounded-xl overflow-hidden border-2 border-border shadow-xl">
        <ImageBackground
          source={{ uri: uploadedProfilePicture[0] as string }}
          style={{ height: 150, width: "100%" }}
          blurRadius={10}
        >
          {/* Gradient overlay optimized for dark mode readability */}
          <LinearGradient
            colors={["rgba(139, 92, 246, 0.7)", "rgba(59, 130, 246, 0.7)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
            className="items-center justify-end"
          >
            <View className="flex flex-row items-center justify-center my-auto px-5">
              <StablePressable
                className="p-1 rounded-full"
                onPress={() =>
                  router.push({
                    pathname: "/main/profile/inspect-profile",
                    params: { id: user?.id },
                  })
                }
              >
                {profilePictures[0]}
              </StablePressable>

              <View className="flex flex-col items-end flex-[4]">
                <Text className="text-2xl font-extrabold text-center text-white">
                  {identity}
                </Text>

                <View className="flex-col items-end -gap-2">
                  <Text className="text-md font-bold text-white">
                    @{user.username}
                  </Text>
                  <Text className="text-md font-bold text-white">
                    {user.email}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
        <View className="flex flex-col flex-1 px-4 gap-2">
          {/* Content Section */}
          <View className="flex flex-col flex-1 gap-6">
            {user.industries && user.industries.length > 0 ? (
              <View>
                <Text className="font-bold py-2 text-lg">Industries</Text>
                <View className="flex flex-row flex-wrap items-center gap-x-2">
                  {user.industries?.map((ind) => (
                    <Badge key={ind.id} className="rounded-full mt-2 py-1 px-3">
                      <Text className="text-md font-semibold">{ind.label}</Text>
                    </Badge>
                  ))}
                </View>
              </View>
            ) : null}
            {/* Bio */}
            <View>
              <Text className="font-bold py-2 text-lg">Bio</Text>
              <Text className="text-md text-muted-foreground">
                {user.bio || "No bio available."}
              </Text>
            </View>
          </View>
          {/* Fixed Footer Actions */}
          <View className="flex flex-row gap-4 justify-between items-center m-4 px-4">
            <Button
              size={"sm"}
              className={cn(
                `rounded-full h-12 w-12 transition-all duration-200`,
                isBookmarked
                  ? "bg-destructive shadow-lg shadow-red-500/40"
                  : "bg-violet-600 dark:bg-violet-500 active:bg-violet-700 dark:active:bg-violet-600",
              )}
              disabled={
                isBookmarkPending || isSavingBookmark || isDeletingBookmark
              }
              onPress={() => (isBookmarked ? deleteBookmark() : saveBookmark())}
            >
              <Icon
                as={Bookmark}
                size={26}
                className="transition-all duration-200"
                fill={isBookmarked ? "#fff" : "transparent"}
                color={"white"}
              />
            </Button>
            <Button
              size={"sm"}
              className="rounded-full h-16 w-16 bg-teal-600 dark:bg-teal-500 active:bg-teal-700 dark:active:bg-teal-600"
              onPress={() =>
                router.push({
                  pathname: "/main/request/new-request",
                  params: { id: user?.id },
                })
              }
            >
              <Icon
                as={BellRing}
                size={30}
                className="text-white"
                color={"white"}
              />
            </Button>
            <Button
              size={"sm"}
              className="rounded-full h-12 w-12 bg-blue-600 dark:bg-blue-500 active:bg-blue-700 dark:active:bg-blue-600"
              onPress={() => {
                startConversation({ users: [user.id] });
              }}
            >
              <Icon
                as={MessageCircle}
                size={26}
                className="text-white"
                color={"white"}
              />
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
};
