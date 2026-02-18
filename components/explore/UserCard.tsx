import { Button } from "@/components/ui/button";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { ResponseConversationDto, ResponseUserDto } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Heart, MessageCircle, CalendarDays } from "lucide-react-native";
import React from "react";
import { Dimensions, View } from "react-native";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { ImageBackground } from "expo-image";
import { StablePressable } from "../shared/StablePressable";
import { Badge } from "../ui/badge";
import { useStartConversation } from "@/hooks/content/chat/useStartConversation";
import { useServerImages } from "@/hooks/content/useServerImages";

const { width } = Dimensions.get("window");

interface UserCardProps {
  className?: string;
  user: ResponseUserDto;
}

export const UserCard = ({ user, className }: UserCardProps) => {
  const [isLiked, setIsLiked] = React.useState(false);

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
      className={cn("flex-1 px-4 py-4 my-2 h-[75vh]", className)}
      style={{ width: width }}
    >
      <View className="flex-1 bg-background rounded-3xl overflow-hidden border-2 border-purple-200 shadow-xl">
        <ImageBackground
          source={{ uri: uploadedProfilePicture[0] as string }}
          style={{ height: 250, width: "100%" }}
          blurRadius={10}
        >
          {/* Optional gradient overlay for readability */}
          <LinearGradient
            colors={["rgba(255,0,0,0.6)", "rgba(0,0,255,0.6)"]}
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
                <Text className="text-2xl font-extrabold text-foreground text-center">
                  {identity}
                </Text>

                <View className="flex-col items-end -gap-2">
                  <Text className="text-sm font-bold">@{user.username}</Text>
                  <Text className="text-sm font-bold">{user.email}</Text>
                </View>

                <View className="flex-row flex-wrap justify-end gap-2 mt-5">
                  {user.objectives?.map((obj) => (
                    <Badge key={obj.id} className="rounded-full">
                      <Text className="text-xs font-semibold">{obj.label}</Text>
                    </Badge>
                  ))}
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
        {/* Content Section */}
        <View className="flex-1 flex-row flex-wrap items-center gap-x-2 px-4 mt-2">
          {user.industries?.map((ind) => (
            <Badge key={ind.id} className="rounded-full mt-2">
              <Text className="text-xs font-semibold">{ind.label}</Text>
            </Badge>
          ))}
        </View>
        {/* Fixed Footer Actions */}
        <View className="flex-row gap-3 px-5 py-5">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl flex-row gap-2 border-purple-300"
            onPress={() => setIsLiked((v) => !v)}
          >
            <Icon
              as={Heart}
              size={18}
              className={isLiked ? "text-red-500" : "text-purple-500"}
            />
            <Text className={isLiked ? "text-red-500" : "text-purple-500"}>
              Like
            </Text>
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl flex-row gap-2 border-purple-300"
            onPress={() =>
              router.push({
                pathname: "/main/profile/user-calendar",
                params: { id: user?.id },
              })
            }
          >
            <Icon as={CalendarDays} size={18} className="text-purple-500" />
            <Text className="text-purple-500">Calendar</Text>
          </Button>
        </View>
        <View className="flex-row gap-3 px-5 pb-5">
          <Button
            className="flex-1 h-12 rounded-xl flex-row gap-2 bg-purple-500"
            onPress={() => {
              startConversation({ users: [user.id] });
            }}
          >
            <Icon as={MessageCircle} size={18} className="text-white" />
            <Text className="text-white font-semibold">Message</Text>
          </Button>
        </View>
      </View>
    </View>
  );
};
