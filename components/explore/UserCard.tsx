import { Button } from "@/components/ui/button";
import { useServerImage } from "@/hooks/content/useServerImage";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { ResponseUserDto } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Heart, MapPin, MessageCircle } from "lucide-react-native";
import React from "react";
import { Dimensions, View } from "react-native";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { ImageBackground } from "expo-image";
import { ObjectivesBadgeList } from "./ObjectivesBadgeList";
import { StablePressable } from "../shared/StablePressable";

const { width } = Dimensions.get("window");

interface UserCardProps {
  className?: string;
  user: ResponseUserDto;
}

export const UserCard = ({ user, className }: UserCardProps) => {
  const [isLiked, setIsLiked] = React.useState(false);

  const identity = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsx: profilePicture, upload: uploadedProfilePicture } =
    useServerImage({
      id: user?.pictureId,
      fallback,
      wrapperClassName: "border-4 border-white bg-white rounded-full shadow-lg",
      size: { width: 90, height: 90 },
    });

  const router = useRouter();

  const experiences = React.useMemo(() => {
    return user.experiences?.map((exp) => exp.title) ?? [];
  }, [user.experiences]);

  const tags = React.useMemo(() => {
    if (experiences.length > 0) return experiences.slice(0, 5);
    return ["Artboard", "CEO", "UX", "Co-Founder"];
  }, [experiences]);

  const tagColors = [
    "bg-purple-500",
    "bg-pink-500",
    "bg-blue-500",
    "bg-orange-500",
    "bg-green-500",
  ];

  return (
    <View
      className={cn("flex-1 px-4 py-4 my-2 h-[75vh]", className)}
      style={{ width: width }}
    >
      <View className="flex-1 bg-background rounded-3xl overflow-hidden border-2 border-purple-200 shadow-xl">
        <ImageBackground
          source={{ uri: uploadedProfilePicture as string }}
          style={{ height: 200, width: "100%" }}
          blurRadius={10} // 👈 crank this up for more blur
        >
          {/* Optional gradient overlay for readability */}
          <LinearGradient
            colors={["rgba(168,85,247,0.6)", "rgba(236,72,153,0.6)"]}
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
                {profilePicture}
              </StablePressable>

              <View className="flex flex-col items-end flex-[4]">
                <Text className="text-2xl font-bold text-foreground text-center">
                  {identity}
                </Text>

                <View className="flex-row items-center gap-1 mt-1">
                  <Icon
                    as={MapPin}
                    size={14}
                    className="text-muted-foreground"
                  />
                  <Text className="text-sm">Brooklyn, NY</Text>
                </View>

                <View className="flex-row flex-wrap justify-end gap-2 mt-5">
                  {tags.map((tag, idx) => (
                    <View
                      key={idx}
                      className={cn(
                        "rounded-full px-4 py-1.5",
                        tagColors[idx % tagColors.length],
                      )}
                    >
                      <Text className="text-xs font-semibold">{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
        {/* Content Section */}
        <View className="flex-1 items-center">
          <ObjectivesBadgeList />
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
            className="flex-1 h-12 rounded-xl flex-row gap-2 bg-purple-500"
            onPress={() => router.push("/main/chat")}
          >
            <Icon as={MessageCircle} size={18} className="text-white" />
            <Text className="text-white font-semibold">Message</Text>
          </Button>
        </View>
      </View>
    </View>
  );
};
