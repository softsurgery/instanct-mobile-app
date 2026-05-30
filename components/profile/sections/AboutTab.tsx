import { SeeMoreText } from "@/components/shared/SeeMoreText";
import { StablePressable } from "@/components/shared/StablePressable";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { hslToHex, THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ResponseUserDto } from "@/types";
import {
  ExternalLink,
  Globe,
  Linkedin,
  Link2,
  UserRound,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Linking, RefreshControl, ScrollView, View } from "react-native";

interface AboutTabProps {
  className?: string;
  user: ResponseUserDto;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const PRIMARY = hslToHex(THEME.light.primary);

const SectionHeader = ({
  icon,
  title,
}: {
  icon: React.ComponentProps<typeof Icon>["as"];
  title: string;
}) => (
  <View className="mb-3 flex-row items-center gap-2">
    <Icon as={icon} size={18} color={PRIMARY} />
    <Text className="text-base font-bold text-foreground">{title}</Text>
  </View>
);

export const AboutTab = ({
  className,
  user,
  refreshing,
  onRefresh,
}: AboutTabProps) => {
  const { colorScheme } = useColorScheme();
  const mutedFg = hslToHex(
    colorScheme === "dark"
      ? THEME.dark.mutedForeground
      : THEME.light.mutedForeground,
  );

  return (
    <ScrollView
      className={cn(className)}
      contentContainerStyle={{ paddingTop: 20, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="flex flex-col gap-6 px-4">
        {/* Bio */}
        <View>
          <SectionHeader icon={UserRound} title="About" />
          {user?.bio ? (
            <SeeMoreText
              textClassname="text-sm leading-6 text-foreground"
              numberOfLines={4}
            >
              {user.bio}
            </SeeMoreText>
          ) : (
            <View className="items-center rounded-2xl border border-dashed border-border py-6">
              <Text className="text-sm italic text-muted-foreground">
                No bio added yet
              </Text>
            </View>
          )}
        </View>

        {/* Links */}
        {(user?.website || user?.linkedin) && (
          <View>
            <SectionHeader icon={Link2} title="Links" />
            <View className="flex flex-col gap-2.5">
              {user?.website && (
                <StablePressable
                  className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4"
                  onPress={() => {
                    if (user?.website) Linking.openURL(user?.website);
                  }}
                  onPressClassname="bg-muted"
                >
                  <View
                    className="h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${PRIMARY}14` }}
                  >
                    <Icon as={Globe} size={18} color={PRIMARY} />
                  </View>
                  <Text
                    className="flex-1 text-sm font-medium text-foreground"
                    numberOfLines={1}
                  >
                    {user.website}
                  </Text>
                  <Icon as={ExternalLink} size={16} color={mutedFg} />
                </StablePressable>
              )}
              {user?.linkedin && (
                <StablePressable
                  className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4"
                  onPress={() => {
                    if (user?.linkedin) Linking.openURL(user?.linkedin);
                  }}
                  onPressClassname="bg-muted"
                >
                  <View
                    className="h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${PRIMARY}14` }}
                  >
                    <Icon as={Linkedin} size={18} color={PRIMARY} />
                  </View>
                  <Text className="flex-1 text-sm font-medium text-foreground">
                    LinkedIn Profile
                  </Text>
                  <Icon as={ExternalLink} size={16} color={mutedFg} />
                </StablePressable>
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
