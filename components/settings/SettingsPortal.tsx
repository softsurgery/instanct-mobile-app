import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { identifyUser } from "@/lib/user";
import { router } from "expo-router";
import { ChevronRight, LogOut, Trash2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import StableScrollView from "../shared/StableScrollView";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Separator } from "../ui/separator";
import { Text } from "../ui/text";
import { createSettingRow, SettingRow } from "./SettingsRow";
import type { SettingRowConfig } from "./SettingsRow";
import { useLogout } from "@/hooks/useLogout";
import { AppHeaderBack } from "../shared/AppHeaderBack";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner-native";

interface SettingsPortalProps {
  className?: string;
}

interface SettingsSection {
  key: string;
  title: string;
  description: string;
  rows: SettingRowConfig[];
  showOnDevelopment?: boolean;
}

export const SettingsPortal = ({ className }: SettingsPortalProps) => {
  const queryClient = useQueryClient();
  const { t: tSettings } = useTranslation("settings");
  const settingsRows: SettingsSection[] = [
    {
      key: "account",
      title: tSettings("settings.account.title"),
      description: tSettings("settings.account.description"),
      rows: [
        createSettingRow({
          title: tSettings("settings.account.screens.profile.title"),
          description: tSettings(
            "settings.account.screens.profile.description",
          ),
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/profile/update-profile"),
        }),
        createSettingRow({
          title: tSettings("settings.account.screens.privacy-security.title"),
          description: tSettings(
            "settings.account.screens.privacy-security.description",
          ),
          className: "p-1 px-4",
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/profile/privacy-security"),
        }),
      ],
      showOnDevelopment: false,
    },
    {
      key: "preferences",
      title: tSettings("settings.preferences.title"),
      description: tSettings("settings.preferences.description"),
      rows: [
        createSettingRow({
          title: tSettings("settings.preferences.screens.language.title"),
          description: tSettings(
            "settings.preferences.screens.language.description",
          ),
          className: "p-1 px-4",
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/settings/language"),
        }),
        createSettingRow({
          title: tSettings("settings.preferences.screens.theme.title"),
          description: tSettings(
            "settings.preferences.screens.theme.description",
          ),
          className: "p-1 px-4",
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/settings/theme"),
        }),
      ],
      showOnDevelopment: false,
    },
    {
      key: "support",
      title: tSettings("settings.support.title"),
      description: tSettings("settings.support.description"),
      rows: [
        createSettingRow({
          title: tSettings("settings.support.screens.report-bug.title"),
          description: tSettings(
            "settings.support.screens.report-bug.description",
          ),

          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/profile/support/report-bug"),
        }),
        createSettingRow({
          title: tSettings("settings.support.screens.send-feedback.title"),
          description: tSettings(
            "settings.support.screens.send-feedback.description",
          ),
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/profile/support/send-feedback"),
        }),
        createSettingRow({
          title: tSettings("settings.support.screens.faqs.title"),
          description: tSettings("settings.support.screens.faqs.description"),
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/profile/support/faqs"),
        }),
      ],
      showOnDevelopment: false,
    },
    {
      key: "info",
      title: tSettings("settings.info-legal.title"),
      description: tSettings("settings.info-legal.description"),
      rows: [
        createSettingRow({
          title: tSettings(
            "settings.info-legal.screens.terms-of-service.title",
          ),
          description: tSettings(
            "settings.info-legal.screens.terms-of-service.description",
          ),
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/settings/terms"),
        }),
        createSettingRow({
          title: tSettings("settings.info-legal.screens.privacy-policy.title"),
          description: tSettings(
            "settings.info-legal.screens.privacy-policy.description",
          ),
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/settings/privacy-policy"),
        }),
        createSettingRow({
          title: tSettings("settings.info-legal.screens.about.title"),
          description: tSettings(
            "settings.info-legal.screens.about.description",
          ),
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/settings/about"),
        }),
      ],
      showOnDevelopment: false,
    },
    {
      key: "test",
      title: "Test",
      description: "This is just for development purposes",
      rows: [
        createSettingRow({
          title: "Deep link",
          description: "Test deep linking",
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/test/deep-link-test"),
        }),
        createSettingRow({
          title: "Invalidate Queries",
          description: "Invalidate all queries",
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => {
            queryClient.invalidateQueries();
            toast.success("Queries invalidated successfully", {
              description: "All queries have been invalidated",
            });
          },
        }),
      ],
      showOnDevelopment: true,
    },
  ].filter((section) => !section.showOnDevelopment || __DEV__);

  const { t } = useTranslation("common");
  const { currentUser } = useCurrentUser();
  const logout = useLogout();

  return (
    <StableSafeAreaView className={cn("flex flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.settings.title")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <StableScrollView className="flex-1 bg-background">
        <View className="flex flex-col">
          <View className="px-4 mb-4">
            <View className="flex flex-col justify-between p-4">
              <View className="flex flex-row justify-between items-center w-full">
                <Text variant="h4">
                  {identifyUser(currentUser) || "Your account"}
                </Text>

                {currentUser?.username ? (
                  <Badge variant="outline" className="self-start">
                    <Text className="uppercase tracking-wide">
                      @{currentUser.username}
                    </Text>
                  </Badge>
                ) : null}
              </View>

              <Text variant="muted">
                {tSettings("settings.general.description")}
              </Text>
            </View>
          </View>

          {settingsRows.map((section) => (
            <View key={section.key} className="bg-background">
              <View className="px-8 py-4 bg-card mb-4">
                <Text className="text-lg font-semibold">{section.title}</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  {section.description}
                </Text>
              </View>

              <View className="px-4 pb-4 flex flex-col">
                {section.rows.map((row, index) => {
                  const isLast = index === section.rows.length - 1;

                  return (
                    <View key={index} className="flex flex-col gap-2">
                      <SettingRow className="mt-1" {...row} />
                      {!isLast && <Separator className="mb-2" />}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
          <View className="px-4 mt-4">
            <View className={cn("bg-card mb-10 rounded-xl")}>
              <View className="px-4 pt-4 pb-2">
                <Text className="text-lg font-semibold">
                  {tSettings("settings.session.title")}
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  {tSettings("settings.session.description")}
                </Text>
              </View>

              <View className="px-4 pb-4 mt-4 flex flex-col gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex flex-row items-center justify-center gap-2 rounded-xl"
                  onPress={logout}
                >
                  <Icon as={LogOut} size={18} />
                  <Text className="text-md font-bold">
                    {tSettings("settings.session.actions.sign-out")}
                  </Text>
                </Button>

                <Button
                  variant="destructive"
                  size="lg"
                  className="flex flex-row items-center justify-center gap-2 rounded-xl"
                  onPress={() => Alert.alert("Delete account", "Coming soon!")}
                >
                  <Icon as={Trash2} size={18} color="white" />
                  <Text className="text-md font-bold">
                    {tSettings("settings.session.actions.remove-account")}
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
