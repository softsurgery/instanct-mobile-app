import { SeeMoreText } from "@/components/shared/SeeMoreText";
import { StablePressable } from "@/components/shared/StablePressable";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useColorPalette } from "@/hooks/useColorPalette";
import { hslToHex, THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ResponseUserDto } from "@/types";
import {
  ExternalLink,
  Globe,
  Linkedin,
  Link2,
  UserRound,
  LucideIcon,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

interface AboutTabProps {
  className?: string;
  user: ResponseUserDto | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const SectionHeader = ({
  icon,
  title,
  color = hslToHex(THEME.light.primary),
}: {
  icon: LucideIcon;
  title: string;
  color?: string;
}) => (
  <View className="mb-3 flex-row items-center gap-2">
    <Icon as={icon} size={18} color={color} />
    <Text className="text-base font-bold text-foreground">{title}</Text>
  </View>
);

export const AboutTab = ({
  className,
  user,
  refreshing,
  onRefresh,
  onScroll,
}: AboutTabProps) => {
  const { t } = useTranslation("menu");
  const { palette } = useColorPalette();
  const fg = hslToHex(palette.foreground);
  const primary = hslToHex(palette.primary);

  return (
    <ScrollView
      className={cn(className)}
      onScroll={onScroll}
      contentContainerStyle={{ paddingTop: 20, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="flex flex-col gap-6 px-4">
        {/* Bio */}
        <View>
          <SectionHeader icon={UserRound} title={t("menu.tabs.about.title")} />
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
                {t("menu.tabs.about.empty")}
              </Text>
            </View>
          )}
        </View>

        {/* Links */}
        {(user?.website || user?.linkedin) && (
          <View>
            <SectionHeader
              icon={Link2}
              title={t("menu.tabs.about.links.title")}
              color={primary}
            />
            <View className="flex flex-col gap-2.5">
              {user?.website && (
                <StablePressable
                  className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4"
                  onPress={() => {
                    if (user?.website) Linking.openURL(user?.website);
                  }}
                  onPressClassname="bg-muted"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-xl">
                    <Icon as={Globe} size={24} color={primary} />
                  </View>
                  <Text
                    className="flex-1 text-sm font-medium text-foreground"
                    numberOfLines={1}
                  >
                    {user.website}
                  </Text>
                  <Icon as={ExternalLink} size={24} color={fg} />
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
                  <View className="h-9 w-9 items-center justify-center rounded-xl">
                    <Icon as={Linkedin} size={24} color={primary} />
                  </View>
                  <Text className="flex-1 text-sm font-medium text-foreground">
                    {t("menu.tabs.about.links.linkedin")}
                  </Text>
                  <Icon as={ExternalLink} size={24} color={fg} />
                </StablePressable>
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
