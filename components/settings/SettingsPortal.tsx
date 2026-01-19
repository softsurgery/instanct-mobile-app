import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { identifyUser } from "@/lib/user";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Globe2,
  LogOut,
  MoonStar,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { StableScrollView } from "../shared/StableScrollView";
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
import { SettingRow } from "./SettingsRow";

const settingsRows = [
  {
    key: "account",
    title: "Account",
    description: "Keep your profile and security details up to date.",
    rows: [
      {
        icon: UserRound,
        title: "Profile",
        description: "Update your bio, avatar and socials",
        route: "/main/update-profile",
      },
      {
        icon: ShieldCheck,
        title: "Privacy",
        description: "Manage who can find you",
        comingSoon: true,
      },
    ],
  },
  {
    key: "preferences",
    title: "Preferences",
    description: "Tailor Instanct to your daily habits.",
    rows: [
      {
        icon: Globe2,
        title: "Language",
        description: "Set your preferred language",
        type: "language",
      },
      {
        icon: Bell,
        title: "Notifications",
        description: "Control alerts and reminders",
        route: "/main/notifications",
      },
      {
        icon: MoonStar,
        title: "Appearance",
        description: "Switch between light and dark mode",
        type: "theme",
      },
    ],
  },
];

interface SettingsPortalProps {
  className?: string;
}

export const SettingsPortal = ({ className }: SettingsPortalProps) => {
  const { t } = useTranslation("common");
  const { toggleColorScheme } = useColorScheme();
  const queryClient = useQueryClient();
  const mapStore = useMapStore();
  const authPersistStore = useAuthPersistStore();
  const { currentUser } = useCurrentUser();

  const {
    language,
    theme,
    toggleTheme: persistToggleTheme,
  } = usePreferencePersistStore();

  const logout = () => {
    authPersistStore.logout?.();
    mapStore.reset();
    queryClient.clear();
    router.replace("/");
  };

  const toggleTheme = React.useCallback(() => {
    persistToggleTheme();
    setAndroidNavigationBar(theme);
    toggleColorScheme();
  }, [persistToggleTheme, theme, toggleColorScheme]);

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
            onPress: () => {
              router.back();
            },
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
                    <View key={row.title}>
                      <SettingRow
                        icon={row.icon}
                        title={row.title}
                        description={
                          row.type === "language"
                            ? `Currently set to ${language.toUpperCase()}`
                            : row.type === "theme"
                              ? theme === "dark"
                                ? "Dark mode is on"
                                : "Light mode is on"
                              : row.description
                        }
                        trailing={
                          row.type === "language" ? (
                            <Badge variant="outline">
                              <Text className="text-xs font-medium">
                                {language.toUpperCase()}
                              </Text>
                            </Badge>
                          ) : row.type === "theme" ? (
                            <ThemeToggle className="mx-0" />
                          ) : row.comingSoon ? (
                            <Badge variant="outline">
                              <Text className="text-xs font-medium">Soon</Text>
                            </Badge>
                          ) : undefined
                        }
                        onPress={() => {
                          if (row.route) {
                            router.push(row.route);
                          } else if (row.type === "theme") {
                            toggleTheme();
                          }
                        }}
                      />
                      {!isLast && <Separator className="my-1" />}
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
                onPress={() => {
                  Alert.alert("Delete account", "Coming soon!");
                }}
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
