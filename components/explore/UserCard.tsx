import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "expo-router";
import {
  Heart,
  MessageCircle,
  Phone,
  Lock,
  Venus,
  Mars,
  Unlock,
} from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { Text } from "../ui/text";
import { ResponseUserDto } from "@/types";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { useServerImage } from "@/hooks/content/useServerImage";
import { Icon } from "../ui/icon";

interface UserCardProps {
  user: ResponseUserDto;
  isDarkMode?: boolean;
}

export const UserCard = ({ user, isDarkMode }: UserCardProps) => {
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
    <Card className="border-border/50 bg-card overflow-hidden">
      <CardTitle>
        <View className="flex flex-row items-center gap-2 px-4">
          {profilePicture}
          <View className="absolute -bottom-1 left-4 rounded-full p-1.5 border border-border">
            <Icon
              as={user.isPrivate ? Lock : Unlock}
              size={12}
              className="text-secondary-foreground"
            />
          </View>
          <View className="absolute -bottom-1 left-20 bg-green-500 rounded-full p-1.5 border border-background" />
          <View>
            <Text className="text-xl font-bold line-clamp-1">{identity}</Text>
            <Text className="text-sm text-muted-foreground">
              @{user.username}
            </Text>
          </View>
        </View>
      </CardTitle>
      <CardDescription>
        <View className="px-4">
          {(user.gender || user.phone) && (
            <View className="flex-row gap-3 mb-3 flex-wrap">
              {user.gender && (
                <View className="bg-secondary px-3 py-1.5 rounded-lg">
                  <View className="flex-row items-center gap-1.5">
                    {user.gender === "Male" ? (
                      <Icon as={Mars} size={14} />
                    ) : (
                      <Icon as={Venus} size={14} />
                    )}
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
      </CardDescription>
      <CardContent className="px-4">
        {/* Name and Username */}

        {/* Info Row: Gender, Phone, etc */}

        {/* Bio */}
        {user.bio && (
          <View className="mb-4">
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
                onPress={() => setIsExpanded((value) => !value)}
                className="self-start px-0 mt-2 h-auto"
              >
                <Text className="text-primary text-sm font-semibold">
                  {isExpanded ? "Show less" : "Show more"}
                </Text>
              </Button>
            )}
          </View>
        )}

        {/* Skills Section */}
        {user.skills && user.skills.length > 0 && (
          <View className="mb-4">
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
              Skills
            </Text>
            <View className="flex-row gap-2 flex-wrap">
              {user.skills.map((skill, idx) => (
                <View
                  key={idx}
                  className="bg-primary/10 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-xs font-medium text-primary">
                    {skill.name}
                  </Text>
                </View>
              ))}
              {user.skills.length > 5 && (
                <View className="bg-primary/10 px-3 py-1.5 rounded-full">
                  <Text className="text-xs font-medium text-primary">
                    +{user.skills.length - 5}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Experiences Section */}
        {user.experiences && user.experiences.length > 0 && (
          <View className="mb-4">
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
              Experience
            </Text>
            {user.experiences.slice(0, 2).map((exp, idx) => (
              <View key={idx} className="mb-2">
                <Text className="text-sm font-semibold text-foreground">
                  {exp.title || "Position"}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {exp.company || "Company"}
                </Text>
              </View>
            ))}
            {user.experiences.length > 2 && (
              <Text className="text-xs text-primary font-semibold">
                +{user.experiences.length - 2} more
              </Text>
            )}
          </View>
        )}

        {/* Educations Section */}
        {user.educations && user.educations.length > 0 && (
          <View className="mb-4">
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
              Education
            </Text>
            {user.educations.slice(0, 2).map((edu, idx) => (
              <View key={idx} className="mb-2">
                <Text className="text-sm font-semibold text-foreground">
                  {edu.school || "Institution"}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {edu.degree}
                </Text>
              </View>
            ))}
            {user.educations.length > 2 && (
              <Text className="text-xs text-primary font-semibold">
                +{user.educations.length - 2} more
              </Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-2 justify-between pt-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setIsLiked((v) => !v)}
            className={cn(
              "flex-row gap-2",
              isLiked ? "text-red-500" : "text-muted-foreground",
            )}
          >
            <Icon as={Heart} size={20} />
            <Text
              className={isLiked ? "text-red-500" : "text-muted-foreground"}
            >
              Like
            </Text>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex-row gap-2 text-muted-foreground"
            onPress={() => router.push("/main/chat")}
          >
            <Icon as={MessageCircle} size={20} />
            <Text className="text-muted-foreground">Message</Text>
          </Button>
        </View>
      </CardContent>
    </Card>
  );
};
