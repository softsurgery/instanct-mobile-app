import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  Eye,
  Lock,
  Mail,
  Smartphone,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { ApplicationHeader } from "~/components/shared/AppHeader";
import { StableSafeAreaView } from "~/components/shared/StableSafeAreaView";
import { SettingRow, createSettingRow } from "../SettingsRow";
import type { SettingRowConfig } from "../SettingsRow";
import { Text } from "~/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import StableScrollView from "@/components/shared/StableScrollView";

interface PrivacySecurityPortalProps {
  className?: string;
}

interface SettingsSection {
  key: string;
  title: string;
  description: string;
  rows: SettingRowConfig[];
}

export const PrivacySecurityPortal = ({
  className,
}: PrivacySecurityPortalProps) => {
  const { t } = useTranslation();
  const cardClass =
    "border-b-border border-t-border bg-background";

  const sections: SettingsSection[] = [
    {
      key: "security",
      title: "Account Security",
      description: "Manage the most important account security actions.",
      rows: [
        createSettingRow({
          title: "Change Email",
          description: "Update the email address linked to your account",
          leftIcon: Mail,
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/profile/change-email"),
        }),
        createSettingRow({
          title: "Change Password",
          description: "Update your password and keep your account protected",
          leftIcon: Lock,
          rightIcon: ChevronRight,
          className: "p-1 px-4",
          onPress: () => router.push("/main/profile/change-password"),
        }),
        createSettingRow({
          title: "Two-Factor Authentication",
          description: "Add an extra layer of protection for sign in",
          leftIcon: Smartphone,
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
      key: "privacy",
      title: "Privacy Controls",
      description: "Choose what you want to share and download.",
      rows: [
        createSettingRow({
          title: "Data Visibility",
          description: "Control who can see your profile and activity",
          leftIcon: Eye,
          className: "p-1 px-4",
          rightComponent: (
            <Badge variant="outline">
              <Text className="text-xs font-medium">Soon</Text>
            </Badge>
          ),
        }),
        createSettingRow({
          title: "Download Your Data",
          description: "Export a copy of your account information",
          leftIcon: Download,
          className: "p-1 px-4",
          rightComponent: (
            <Badge variant="outline">
              <Text className="text-xs font-medium">Soon</Text>
            </Badge>
          ),
        }),
      ],
    },
  ];

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.privacySecurity", "Privacy & Security")}
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

      <StableScrollView className="bg-background ">
        <View className="flex flex-col">
          {sections.map((section) => (
            <View key={section.key} className={cardClass}>
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
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
