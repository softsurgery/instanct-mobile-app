import React from "react";
import { SettingsInfoScreen } from "./SettingsInfoScreen";

export const AboutInstanct = () => {
  return (
    <SettingsInfoScreen
      title="About Instanct"
      subtitle="Instanct helps people discover, connect, and feel at home in their communities."
      updatedLabel="Updated Feb 5, 2026"
      sections={[
        {
          title: "Our Mission",
          description:
            "We build tools that help people connect with confidence.",
          bullets: [
            "Create meaningful connections based on shared interests.",
            "Make local discovery simple and human-first.",
            "Prioritize safety, trust, and inclusive experiences.",
          ],
        },
        {
          title: "What We Offer",
          description:
            "Instanct combines curated discovery with thoughtful experiences.",
          bullets: [
            "Personalized recommendations tailored to your preferences.",
            "Community-first features that respect privacy.",
            "A modern, intuitive experience across devices.",
          ],
        },
        {
          title: "Safety & Trust",
          description: "We design with trust at the core.",
          bullets: [
            "Clear policies and transparent product updates.",
            "Proactive moderation to keep interactions respectful.",
            "Responsive support for feedback and reports.",
          ],
        },
        {
          title: "Contact",
          description: "We love hearing from the community.",
          bullets: [
            "Reach out anytime through the in-app support channel.",
            "Send feedback and ideas to help us improve Instanct.",
          ],
        },
      ]}
    />
  );
};
