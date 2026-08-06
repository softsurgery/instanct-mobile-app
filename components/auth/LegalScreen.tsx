import { ApplicationHeader } from "@/components/shared/AppHeader";
import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import StableScrollView from "@/components/shared/StableScrollView";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

export type LegalDocument = "terms" | "privacy";

const DOCUMENT_SECTIONS: Record<LegalDocument, string[]> = {
  terms: [
    "acceptance",
    "account",
    "acceptableUse",
    "content",
    "termination",
    "changes",
  ],
  privacy: ["collect", "use", "sharing", "retention", "rights", "contact"],
};

interface LegalScreenProps {
  className?: string;
  document: LegalDocument;
}

export const LegalScreen = ({ className, document }: LegalScreenProps) => {
  const { t } = useTranslation("auth");
  const sections = DOCUMENT_SECTIONS[document];

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t(`auth.legal.${document}.title`)}
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
        <View className="px-5 py-6 gap-6">
          <Text className="text-sm leading-6 text-muted-foreground">
            {t(`auth.legal.${document}.intro`)}
          </Text>
          {sections.map((section) => (
            <View key={section} className="gap-2">
              <Text className="text-base font-bold text-foreground">
                {t(`auth.legal.${document}.sections.${section}.heading`)}
              </Text>
              <Text className="text-sm leading-6 text-muted-foreground">
                {t(`auth.legal.${document}.sections.${section}.body`)}
              </Text>
            </View>
          ))}
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
