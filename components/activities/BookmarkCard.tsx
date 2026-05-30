import { View, TouchableOpacity } from "react-native";
import { Text } from "../ui/text";
import { Icon } from "../ui/icon";
import { ResponseUserDto } from "@/types";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { useServerImages } from "@/hooks/content/useServerImages";
import { useRouter } from "expo-router";
import { hslToHex, THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Bookmark, ChevronRight } from "lucide-react-native";
import { useColorScheme } from "nativewind";

interface BookmarkCardProps {
  className?: string;
  user?: ResponseUserDto;
}

const PRIMARY = hslToHex(THEME.light.primary);

export const BookmarkCard = ({ className, user }: BookmarkCardProps) => {
  const ids = [user?.pictureId];
  const fallbacks = [identifyUserAvatar(user)];
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const mutedFg = hslToHex(
    colorScheme === "dark"
      ? THEME.dark.mutedForeground
      : THEME.light.mutedForeground,
  );

  const { jsxArray: bookmarkImages } = useServerImages({
    ids,
    fallbacks,
    className: "w-14 h-14 rounded-full",
    size: { width: 60, height: 60 },
  });

  // Prefer a meaningful subtitle that says *why* this person is worth saving.
  const subtitle = user?.industries?.length
    ? user.industries
        .map((industry) => industry?.label)
        .filter(Boolean)
        .join(" · ")
    : user?.bio?.trim() || user?.email;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={className}
      onPress={() =>
        router.push({
          pathname: "/main/profile/inspect-profile",
          params: { id: user?.id },
        })
      }
    >
      <View className="flex-row items-center gap-3.5 p-3 ">
        {/* Avatar with brand ring + saved marker */}
        <View className="relative">
          <View
            className="rounded-full p-[3px]"
            style={{ backgroundColor: `${PRIMARY}1f` }}
          >
            <View className="rounded-full bg-muted">{bookmarkImages[0]}</View>
          </View>
          <View
            className="absolute -bottom-0.5 -right-0.5 h-6 w-6 items-center justify-center rounded-full border-2 border-card"
            style={{ backgroundColor: PRIMARY }}
          >
            <Icon as={Bookmark} size={12} color="#ffffff" fill="#ffffff" />
          </View>
        </View>

        {/* Identity */}
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-[16px] font-semibold text-foreground"
          >
            {identifyUser(user)}
          </Text>
          {!!subtitle && (
            <Text
              numberOfLines={1}
              className="mt-0.5 text-[13px] text-muted-foreground"
            >
              {subtitle}
            </Text>
          )}
        </View>

        <Icon as={ChevronRight} size={20} color={mutedFg} />
      </View>
    </TouchableOpacity>
  );
};
