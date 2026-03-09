import React from "react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { identifyUser } from "@/lib/user";
import { useMapStore } from "@/stores/useMapStore";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ArrowLeft, ChevronRight, LogOut, Trash2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import StableScrollView from "../shared/StableScrollView";
import { ThemeToggle } from "../ThemeToggle";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Separator } from "../ui/separator";
import { Text } from "../ui/text";
import { createSettingRow, SettingRow } from "./SettingsRow";
import type { SettingRowConfig } from "./SettingsRow";

interface SettingsPortalProps {
  className?: string;
}

interface SettingsSection {
  key: string;
  title: string;
  description: string;
  rows: SettingRowConfig[];
}

export const SettingsPortal = ({ className }: SettingsPortalProps) => {
  const cardClass =
    "border border-b-border border-t-border bg-card shadow-sm overflow-hidden";

  const primaryCardClass =
    "rounded-2xl border border-primary/10 bg-primary/5 shadow-sm overflow-hidden";

  const destructiveCardClass =
    "rounded-2xl border border-destructive/60 bg-destructive/5 shadow-sm overflow-hidden";

  const settingsRows: SettingsSection[] = [
    {
      key: "account",
      title: "Account",
      description: "Keep your profile and security details up to date.",
      rows: [
        createSettingRow({
          title: "Profile",
          description: "Update your bio, avatar and socials",
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/profile/update-profile"),
        }),
        createSettingRow({
          title: "Privacy & Security",
          description: "Set your preferred privacy and security options",
          className: "p-1 px-4",
          rightComponent: (
            <Badge variant="outline">
              <Text className="text-xs font-medium">Soon</Text>
            </Badge>
          ),
        }),
      ],
    },
    {
      key: "preferences",
      title: "Preferences",
      description: "Tailor Instanct to your daily habits.",
      rows: [
        createSettingRow({
          className: "p-1 px-4",
          Component: () => (
            <View
              className={cn("flex flex-col justify-between gap-4", className)}
            >
              <View>
                <Text className="font-semibold text-base">Language</Text>
                <Text className="text-xs text-muted-foreground">
                  Set your preferred language
                </Text>
              </View>
              <LanguageSwitcher />
            </View>
          ),
        }),
        createSettingRow({
          title: "Appearance",
          description: "Switch between light and dark mode",
          rightComponent: <ThemeToggle className="mx-0" />,
          className: "p-1 px-4",
        }),
      ],
    },
    {
      key: "support",
      title: "Support",
      description: "Report issues or send us your feedback.",
      rows: [
        createSettingRow({
          title: "Report a Bug",
          description: "Found an issue? Let us know.",
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/profile/support/report-bug"),
        }),
        createSettingRow({
          title: "Send Feedback",
          description: "Have suggestions? We want to hear them.",
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/profile/support/send-feedback"),
        }),
        createSettingRow({
          title: "Frequently Asked Questions",
          description: "Find answers to common questions",
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/profile/support/faqs"),
        }),
      ],
    },
    {
      key: "info",
      title: "Info & Legal",
      description: "Learn more about Instanct and our policies.",
      rows: [
        createSettingRow({
          title: "Terms & Conditions",
          description: "Rules for using Instanct",
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/terms"),
        }),
        createSettingRow({
          title: "Privacy Policy",
          description: "How we handle your data",
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/privacy-policy"),
        }),
        createSettingRow({
          title: "About Instanct",
          description: "What we stand for",
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/about"),
        }),
      ],
    },
    {
      key: "testing",
      title: "Testing Screens",
      description: "Screens used for testing and development purposes.",
      rows: [
        createSettingRow({
          title: "Accept Meeting Request",
          description: "Test the accept meeting request screen",
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/accept"),
        }),
        createSettingRow({
          title: "Send Meeting Request",
          description: "Test the send meeting request screen",
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/demande"),
        }),
      ],
    },
  ];

  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const mapStore = useMapStore();
  const authPersistStore = useAuthPersistStore();
  const { currentUser } = useCurrentUser();

  const logout = () => {
    authPersistStore.logout?.();
    mapStore.reset();
    queryClient.clear();
    router.replace("/");
  };

  return (
    <StableSafeAreaView className={cn("flex flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={t("screens.settings")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => router.back(),
          },
        ]}
      />
      <StableScrollView>
        <View className="flex flex-col">
          <View className="px-4 mb-4">
            <View className={cn("mt-4", primaryCardClass)}>
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
                  Signed in and synced across devices. Make changes that feel
                  personal.
                </Text>
              </View>
            </View>
          </View>

          {settingsRows.map((section) => (
            <View key={section.key} className={cardClass}>
              <View className="px-8 py-4 bg-background/75 mb-4">
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
            <View className={cn(destructiveCardClass, "mb-10")}>
              <View className="px-4 pt-4 pb-2">
                <Text className="text-lg font-semibold">Session</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Sign out or remove your account.
                </Text>
              </View>

              <View className="px-4 pb-4 flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="flex flex-row items-center justify-center gap-2"
                  onPress={logout}
                >
                  <Icon as={LogOut} size={18} className="text-foreground" />
                  <Text>Logout</Text>
                </Button>

                <Button
                  variant="destructive"
                  className="flex flex-row items-center justify-center gap-2"
                  onPress={() => Alert.alert("Delete account", "Coming soon!")}
                >
                  <Icon as={Trash2} size={18} color="white" />
                  <Text>Delete Account</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
