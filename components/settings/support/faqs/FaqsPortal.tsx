import React from "react";
import {
  ArrowLeft,
  HelpCircle,
  MessageCircleQuestion,
} from "lucide-react-native";
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
import { Loader } from "@/components/shared/Loader";
import { Icon } from "@/components/ui/icon";

import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
interface Faq {
  question: string;
  answer: string;
}

const FALLBACK_FAQS: Faq[] = [
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

interface FaqsPortalProps {
  className?: string;
}

export const FaqsPortal = ({ className }: FaqsPortalProps) => {
  const { t } = useTranslation("common");

  const { dataStore, isDataStorePending } = useDataStore<Faq[]>({
    id: StoreIDs.FAQS,
  });

  const displayFaqs = dataStore?.length ? dataStore : FALLBACK_FAQS;

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{
          wrapper: "border-b border-border pb-2 bg-transparent",
        }}
        title={t("screens.settings.faqs")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <StableScrollView
        showsVerticalScrollIndicator={false}
        className="bg-background"
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
      >
        <View className="px-5 py-6">
          {/* Intro */}
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center">
              <Icon
                as={MessageCircleQuestion}
                size={22}
                className="text-primary"
              />
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-lg font-semibold text-foreground">
                How can we help?
              </Text>
            </View>
          </View>
          <Text className="text-sm leading-relaxed text-muted-foreground mb-4">
            Find quick answers to common questions and get the support you need.
          </Text>

          {/* FAQ list */}
          {isDataStorePending ? (
            <View className="flex-1 items-center justify-center py-20">
              <Loader />
            </View>
          ) : (
            <Accordion type="multiple" collapsible className="w-full gap-3">
              {displayFaqs.map((faq) => (
                <AccordionItem
                  key={faq.question}
                  value={faq.question}
                  className="overflow-hidden"
                >
                  <AccordionTrigger className="py-4">
                    <Text className="flex-1 pr-3 text-base font-medium leading-snug text-foreground">
                      {faq.question}
                    </Text>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Text className="pb-4 text-sm leading-7 text-muted-foreground">
                      {faq.answer}
                    </Text>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {/* Support footer */}
          {!isDataStorePending && (
            <View className="mt-8 items-center gap-2 rounded-lg border border-border bg-card px-6 py-7">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon as={HelpCircle} size={24} />
              </View>
              <Text className="text-base font-semibold text-foreground">
                Still need help?
              </Text>
              <Text className="text-center text-sm leading-relaxed text-muted-foreground">
                Can't find what you're looking for? Our support team is here for
                you.
              </Text>
            </View>
          )}
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
