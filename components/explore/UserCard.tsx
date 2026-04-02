import { Button } from "@/components/ui/button";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { ResponseConversationDto, ResponseUserDto } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  MessageCircle,
  CalendarDays,
  Bookmark,
  Handshake,
} from "lucide-react-native";
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
      className={cn("flex-1 min-h-full", className)}
      style={{ width: width }}
    >
      <View className="flex-1 bg-background mx-4 my-2 rounded-xl overflow-hidden border-2 border-border shadow-xl">
        <ImageBackground
          source={{ uri: uploadedProfilePicture[0] as string }}
          style={{ height: 150, width: "100%" }}
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
                  <Text className="text-md font-bold">@{user.username}</Text>
                  <Text className="text-md font-bold">{user.email}</Text>
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
            {user.objectives && user.objectives.length > 0 ? (
              <View>
                <Text className="font-bold py-2 text-lg">Objectives</Text>
                <View className="flex flex-row flex-wrap items-center gap-x-2">
                  {user.objectives?.map((obj) => (
                    <Badge key={obj.id} className="rounded-full mt-2 py-1 px-3">
                      <Text className="text-md font-semibold">{obj.label}</Text>
                    </Badge>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
          {/* Fixed Footer Actions */}
          <View className="flex flex-row gap-4 justify-between m-4">
            <Button
              variant="secondary"
              size={"sm"}
              className="rounded-full h-16 w-16 bg-[#7B4FBF]"
              onPress={() => setIsLiked((v) => !v)}
            >
              <Icon
                as={Bookmark}
                size={32}
                fill={isLiked ? "red" : "transparent"}
                color={isLiked ? "red" : "white"}
              />
            </Button>
            <Button
              size={"sm"}
              className="rounded-full h-16 w-16 bg-[#4A90D9]"
              onPress={() => {
                startConversation({ users: [user.id] });
              }}
            >
              <Icon
                as={MessageCircle}
                size={32}
                className="text-white"
                color={"white"}
              />
            </Button>
            <Button
              variant="secondary"
              size={"sm"}
              className="rounded-full h-16 w-16 bg-[#3DBFA0]"
              onPress={() =>
                router.push({
                  pathname: "/main/request/new-request",
                  params: { id: user?.id },
                })
              }
            >
              <Icon
                as={Handshake}
                size={32}
                className="text-purple-500"
                color={"white"}
              />
            </Button>
            <Button
              variant="secondary"
              size={"sm"}
              className="rounded-full h-16 w-16 bg-[#29C9E0]"
              onPress={() =>
                router.push({
                  pathname: "/main/profile/user-calendar",
                  params: { id: user?.id },
                })
              }
            >
              <Icon
                as={CalendarDays}
                size={32}
                className="text-purple-500"
                color={"white"}
              />
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
};
