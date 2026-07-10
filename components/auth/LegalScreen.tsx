import { ApplicationHeader } from "@/components/shared/AppHeader";
import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import StableScrollView from "@/components/shared/StableScrollView";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { View } from "react-native";

export type LegalDocument = "terms" | "privacy";

interface Section {
  heading: string;
  body: string;
}

interface Document {
  title: string;
  intro: string;
  sections: Section[];
}

const DOCUMENTS: Record<LegalDocument, Document> = {
  terms: {
    title: "Terms of Use",
    intro:
      "Please read these Terms of Use carefully before using Instanct. By creating an account or signing in, you agree to be bound by these terms.",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        body: "By accessing or using Instanct, you confirm that you can form a binding contract with us and that you accept these terms and agree to comply with them.",
      },
      {
        heading: "2. Your Account",
        body: "You are responsible for keeping your account credentials secure and for all activity that happens under your account. Provide accurate information and keep it up to date.",
      },
      {
        heading: "3. Acceptable Use",
        body: "You agree not to misuse the service, including by harassing other users, posting unlawful content, or attempting to disrupt or gain unauthorized access to the platform.",
      },
      {
        heading: "4. Content",
        body: "You retain ownership of the content you share, but grant us a license to host and display it so we can operate the service. You are solely responsible for what you post.",
      },
      {
        heading: "5. Termination",
        body: "We may suspend or terminate your access if you violate these terms. You may stop using the service and delete your account at any time.",
      },
      {
        heading: "6. Changes",
        body: "We may update these terms from time to time. Continued use of Instanct after changes take effect means you accept the revised terms.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "This Privacy Policy explains what information Instanct collects, how we use it, and the choices you have.",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "We collect the information you provide when you sign up, such as your name, email, username, and profile details, as well as information generated as you use the service.",
      },
      {
        heading: "2. How We Use Information",
        body: "We use your information to provide and improve the service, personalize your experience, keep the platform safe, and communicate with you about your account.",
      },
      {
        heading: "3. Sharing",
        body: "We do not sell your personal information. We share it only with service providers who help us run Instanct, or when required by law.",
      },
      {
        heading: "4. Data Retention",
        body: "We keep your information for as long as your account is active or as needed to provide the service and comply with our legal obligations.",
      },
      {
        heading: "5. Your Rights",
        body: "You can access, update, or delete your personal information from your account settings, or by contacting us. You may also request a copy of your data.",
      },
      {
        heading: "6. Contact",
        body: "If you have questions about this policy or how we handle your data, please contact our support team.",
      },
    ],
  },
};

interface LegalScreenProps {
  className?: string;
  document: LegalDocument;
}

export const LegalScreen = ({ className, document }: LegalScreenProps) => {
  const doc = DOCUMENTS[document];

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={doc.title}
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
            {doc.intro}
          </Text>
          {doc.sections.map((section) => (
            <View key={section.heading} className="gap-2">
              <Text className="text-base font-bold text-foreground">
                {section.heading}
              </Text>
              <Text className="text-sm leading-6 text-muted-foreground">
                {section.body}
              </Text>
            </View>
          ))}
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
