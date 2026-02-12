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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
          onPress: () => router.push("/main/profile/update-profile"),
        }),
        createSettingRow({
          title: "Privacy & Security",
          description: "Set your preferred privacy and security options",
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
          component: () => (
            <View className="flex flex-col justify-between gap-4">
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
          onPress: () => router.push("/main/terms"),
        }),
        createSettingRow({
          title: "Privacy Policy",
          description: "How we handle your data",
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/privacy-policy"),
        }),
        createSettingRow({
          title: "About Instanct",
          description: "What we stand for",
          rightIcon: ChevronRight,
          onPress: () => router.push("/main/about"),
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
        <View className="flex flex-col gap-4 p-4 pb-10">
          <Card className="border-primary/10 bg-primary/5">
            <CardContent className="flex flex-col justify-between px-4 gap-2">
              <View className="flex flex-1 flex-row justify-between items-center w-full">
                <Text variant={"h4"}>
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
              <Text variant={"muted"}>
                Signed in and synced across devices. Make changes that feel
                personal.
              </Text>
            </CardContent>
          </Card>

          {settingsRows.map((section) => (
            <Card key={section.key}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col">
                {section.rows.map((row, index) => {
                  const isLast = index === section.rows.length - 1;
                  return (
                    <View key={index} className="flex flex-col gap-4">
                      <SettingRow className="mt-2" {...row} />
                      {!isLast && <Separator />}
                    </View>
                  );
                })}
              </CardContent>
            </Card>
          ))}

          <Card className="border-destructive/60 bg-destructive/5">
            <CardHeader>
              <CardTitle>Session</CardTitle>
              <CardDescription>
                Sign out or remove your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                variant={"outline"}
                className="flex flex-row items-center justify-center gap-2"
                onPress={logout}
              >
                <Icon as={LogOut} size={18} className="text-foreground" />
                <Text>Logout</Text>
              </Button>
              <Button
                variant={"destructive"}
                className="flex flex-row items-center justify-center gap-2"
                onPress={() => Alert.alert("Delete account", "Coming soon!")}
              >
                <Icon as={Trash2} size={18} color={"white"} />
                <Text>Delete Account</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
