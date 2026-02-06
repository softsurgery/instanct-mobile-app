import React from "react";
import { SettingsInfoScreen } from "./SettingsInfoScreen";

export const PrivacyPolicy = () => {
  return (
    <SettingsInfoScreen
      title="Privacy Policy"
      subtitle="We collect only what we need to deliver a safe, personalized Instanct experience."
      updatedLabel="Updated Feb 5, 2026"
      sections={[
        {
          title: "Information We Collect",
          description: "Depending on how you use Instanct, we collect:",
          bullets: [
            "Profile details like your name, username, photos, and bio.",
            "Usage data such as app interactions, preferences, and diagnostics.",
            "Location data when enabled to power map and nearby features.",
          ],
        },
        {
          title: "How We Use Data",
          description: "Your data helps us:",
          bullets: [
            "Personalize recommendations and improve app performance.",
            "Keep the community safe and prevent abuse.",
            "Communicate important updates and service notices.",
          ],
        },
        {
          title: "Sharing & Disclosure",
          description: "We only share data when necessary:",
          bullets: [
            "With trusted service providers under strict confidentiality.",
            "To comply with legal obligations or protect user safety.",
            "With your consent when you connect third-party services.",
          ],
        },
        {
          title: "Your Choices",
          description: "You control your experience:",
          bullets: [
            "Manage your profile visibility and preferences in Settings.",
            "Opt out of optional data collection where available.",
            "Request account deletion from the Session section in Settings.",
          ],
        },
        {
          title: "Security & Retention",
          description: "We protect your data using industry best practices.",
          bullets: [
            "We retain data only as long as needed to provide the service.",
            "We regularly review and update our security measures.",
          ],
        },
      ]}
    />
  );
};
