import React from "react";
import { ArrowLeft } from "lucide-react-native";
import { View } from "react-native";
import { Loader } from "~/components/shared/Loader";
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

interface FaqsPortalProps {
  className?: string;
}

export const FaqsPortal = ({ className }: FaqsPortalProps) => {
  const { t } = useTranslation("common");

  const pendingFaqs = [
    {
      question: "New FAQs are coming soon",
      answer:
        "We are currently preparing answers for this section. Please check back shortly.",
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

  const faqs = dataStore?.length ? dataStore : pendingFaqs;

  if (isDataStorePending) return <Loader />;
  return (
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
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
      <View
        className={cn("flex flex-col mx-4 my-4 gap-2 bg-background", className)}
      >
        <View>
          <Text className="font-extrabold">Frequently Asked Questions</Text>
          <Text className="font-thin mt-2">
            Find quick answers to common questions and get the support you need.
          </Text>
        </View>

        <Accordion type="multiple" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger>
                <Text className="text-xl font-medium">{faq.question}</Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text className="text-lg text-gray-500 dark:text-gray-300">
                  {faq.answer}
                </Text>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </View>
    </StableSafeAreaView>
  );
};
