import React from "react";
import { ArrowLeft } from "lucide-react-native";
import { View } from "react-native";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { StoreIDs } from "~/types";
import { StableSafeAreaView } from "~/components/shared/StableSafeAreaView";
import { ApplicationHeader } from "~/components/shared/AppHeader";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useDataStore } from "@/hooks/content/useDataStore";
import StableScrollView from "@/components/shared/StableScrollView";

interface FaqsPortalProps {
  className?: string;
}

export const FaqsPortal = ({ className }: FaqsPortalProps) => {
  const { t } = useTranslation("common");

  const faqs = [
    {
      question: "How do I edit my profile?",
      answer:
        "Go to your profile tab and tap the 'Edit Profile' button. You can update your photos, bio, and interests there.",
    },
    {
      question: "Is Instinct free to use?",
      answer:
        "Yes! Instinct is free to download and use. We also offer optional premium subscriptions that unlock exclusive features like unlimited likes and seeing who liked you.",
    },
    {
      question: "How does matching work?",
      answer:
        "We show you profiles based on your preferences and location. Swipe right to like or left to pass. If someone likes you back, it's a match!",
    },
    {
      question: "Can I change my location?",
      answer:
        "Absolutely. You can update your location settings in the app preferences or use our Travel Mode (Premium feature) to match in other cities.",
    },
    {
      question: "How do I report a bug or issue?",
      answer:
        "If you encounter any problems, please use the 'Report a Bug' form in the settings menu or contact our support team directly.",
    },
    {
      question: "Is my data safe?",
      answer:
        "We take user privacy very seriously. All personal data is encrypted and we never share your private information with third parties without consent.",
    },
  ];

  const { dataStore, isDataStorePending } = useDataStore<
    {
      question: string;
      answer: string;
    }[]
  >({
    id: StoreIDs.FAQS,
  });

  const displayFaqs = dataStore?.length ? dataStore : faqs;

  // if (isDataStorePending) return <Loader />;

  return (
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={t("screens.faqs")}
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
      <StableScrollView
        showsVerticalScrollIndicator={false}
        className="bg-background"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 py-6">
          <View className="mb-6 gap-2">
            <Text className="text-muted-foreground text-base leading-relaxed">
              Find quick answers to common questions and get the support you
              need.
            </Text>
          </View>

          <Accordion type="multiple" collapsible className="w-full">
            {displayFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border-b border-border py-2"
              >
                <AccordionTrigger className="py-4">
                  <Text className="text-lg font-semibold text-foreground text-left">
                    {faq.question}
                  </Text>
                </AccordionTrigger>
                <AccordionContent>
                  <Text className="text-base text-muted-foreground leading-7 pb-4">
                    {faq.answer}
                  </Text>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
