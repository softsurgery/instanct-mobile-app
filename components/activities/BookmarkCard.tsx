import { View, TouchableOpacity } from "react-native";
import { Text } from "../ui/text";
import { ResponseUserDto } from "@/types";
import { identifyUserAvatar } from "@/lib/user";
import { useServerImages } from "@/hooks/content/useServerImages";
import { useRouter } from "expo-router";
import { useBookmarkActions } from "@/hooks/content/users/useBookmarkActions";

interface BookmarkCardProps {
  className?: string;
  user?: ResponseUserDto;
}

export const BookmarkCard = ({ className, user }: BookmarkCardProps) => {
  const ids = [user?.pictureId];
  const fallbacks = [identifyUserAvatar(user)];
  const router = useRouter();

  const { jsxArray: bookmarkImages } = useServerImages({
    ids,
    fallbacks,
    className: "w-14 h-14 rounded-full",
    size: { width: 60, height: 60 },
  });

  // const { isBookmarked, toggleBookmark } = useBookmarkActions({
  //   bookmarkId: user?.id!,
  // });

  // const handleBookmarkPress = () => {
  //   toggleBookmark();
  // };

  return (
    <TouchableOpacity
      className={className}
      onPress={() =>
        router.push({
          pathname: "/main/profile/inspect-profile",
          params: { id: user?.id },
        })
      }
    >
      <View className="flex-row items-center gap-4">
        {/* Avatar */}
        <View className="rounded-full bg-muted">{bookmarkImages[0]}</View>

        {/* Header */}
        <View className="flex-row items-center justify-center">
          <View className="flex-1 pr-3">
            <Text
              numberOfLines={1}
              className="text-[17px] font-semibold text-foreground"
            >
              {user?.firstName} {user?.lastName}
            </Text>

            {!!user?.email && (
              <Text className="mt-0.5 text-sm text-muted-foreground">
                {user.email}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
