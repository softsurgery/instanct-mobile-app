import { Button } from "@/components/ui/button";
import { useServerImage } from "@/hooks/content/useServerImage";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { ResponseUserDto } from "@/types";
import { useRouter } from "expo-router";
import {
  Heart,
  Lock,
  Mars,
  MessageCircle,
  Phone,
  Unlock,
  Venus,
} from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { StablePressable } from "../shared/StablePressable";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";

interface UserCardProps {
  className?: string;
  user: ResponseUserDto;
}

export const UserCard = ({ user, className }: UserCardProps) => {
  const [isLiked, setIsLiked] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const identity = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsx: profilePicture } = useServerImage({
    id: user?.pictureId,
    fallback,
    wrapperClassName:
      "border border-border bg-background rounded-full shadow-md",
    size: { width: 80, height: 80 },
  });

  const router = useRouter();

  return (
    <View
      className={cn(
        "border border-border rounded-xl overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <StablePressable
        className="flex flex-row items-center gap-2 p-4"
        onPress={() =>
          router.push({
            pathname: "/main/inspect-profile",
            params: {
              id: user.id,
            },
          })
        }
      >
        <View className="relative">
          {profilePicture}

          {/* Private / Public icon */}
          <View className="absolute -bottom-1 left-1 rounded-full p-1.5 border border-border bg-background">
            <Icon
              as={user.isPrivate ? Lock : Unlock}
              size={12}
              className="text-secondary-foreground"
            />
          </View>

          {/* Active status */}
          <View className="absolute -bottom-1 right-1 bg-green-500 rounded-full p-1.5 border border-background" />
        </View>

        <View>
          <Text className="text-xl font-bold line-clamp-1">{identity}</Text>
          <Text className="text-sm text-muted-foreground">
            @{user.username}
          </Text>
        </View>
      </StablePressable>

      {/* Meta */}
      <View className="px-4 mt-3">
        {(user.gender || user.phone) && (
          <View className="flex-row gap-3 mb-3 flex-wrap">
            {user.gender && (
              <View className="bg-secondary px-3 py-1.5 rounded-lg">
                <View className="flex-row items-center gap-1.5">
                  <Icon as={user.gender === "Male" ? Mars : Venus} size={14} />
                  <Text className="text-xs font-semibold text-secondary-foreground">
                    {user.gender}
                  </Text>
                </View>
              </View>
            )}

            {user.phone && (
              <View className="flex-row gap-1 items-center bg-secondary px-3 py-1.5 rounded-lg">
                <Icon as={Phone} size={14} />
                <Text className="text-xs font-semibold text-secondary-foreground">
                  {user.phone}
                </Text>
              </View>
            )}

            <View className="bg-secondary px-3 py-1.5 rounded-lg">
              <Text className="text-xs font-semibold text-secondary-foreground">
                {user.isPrivate ? "Private" : "Public"}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Bio */}
      {user.bio && (
        <View className="px-4 mb-4">
          <Text
            className="text-sm text-foreground/80 leading-5"
            numberOfLines={isExpanded ? undefined : 3}
          >
            {user.bio}
          </Text>

          {user.bio.length > 120 && (
            <Button
              variant="link"
              size="sm"
              onPress={() => setIsExpanded((v) => !v)}
              className="self-start px-0 mt-2 h-auto"
            >
              <Text className="text-primary text-sm font-semibold">
                {isExpanded ? "Show less" : "Show more"}
              </Text>
            </Button>
          )}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row gap-2 justify-between px-4 py-3 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onPress={() => setIsLiked((v) => !v)}
          className="flex-row gap-2"
        >
          <Icon
            as={Heart}
            size={20}
            className={isLiked ? "text-red-500" : "text-muted-foreground"}
          />
          <Text className={isLiked ? "text-red-500" : "text-muted-foreground"}>
            Like
          </Text>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex-row gap-2"
          onPress={() => router.push("/main/chat")}
        >
          <Icon as={MessageCircle} size={20} />
          <Text className="text-muted-foreground">Message</Text>
        </Button>
      </View>
    </View>
  );
};
