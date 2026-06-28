import React from "react";
import { View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { StableKeyboardAwareScrollView } from "~/components/shared/StableKeyboardAwareScrollView";
import { router } from "expo-router";
import { StableSafeAreaView } from "~/components/shared/StableSafeAreaView";
import { useTranslation } from "react-i18next";
import { ApplicationHeader } from "~/components/shared/AppHeader";
import { ThemeSwitcher } from "../shared/ThemeSwitcher";

import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
interface ThemeSettingsPortalProps {
  className?: string;
}

export const ThemeSettingsPortal = ({
  className,
}: ThemeSettingsPortalProps) => {
  const { t } = useTranslation("common");

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2 bg-transparent" }}
        title={t("screens.settings.theme")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <StableKeyboardAwareScrollView className="flex-1 bg-background">
        <View className="p-4">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            Choose your preferred theme for the app interface.
          </Text>
          <ThemeSwitcher classNames={{ trigger: "my-4" }} />
        </View>
      </StableKeyboardAwareScrollView>
    </StableSafeAreaView>
  );
};
