import React from "react";
import { SettingsInfoScreen } from "./SettingsInfoScreen";

export const TermsAndConditions = () => {
  return (
    <SettingsInfoScreen
      title="Terms & Conditions"
      subtitle="These terms help keep Instanct safe, respectful, and enjoyable for everyone."
      updatedLabel="Updated Feb 5, 2026"
      sections={[
        {
          title: "Using Instanct",
          description: "By using Instanct, you agree to:",
          bullets: [
            "Provide accurate information and keep your account details up to date.",
            "Use Instanct only in ways that are lawful and respectful.",
            "Keep your login credentials secure and notify us of any misuse.",
          ],
        },
        {
          title: "Community Standards",
          description: "To protect the community, you must not:",
          bullets: [
            "Harass, threaten, or discriminate against others.",
            "Share harmful, misleading, or unlawful content.",
            "Impersonate other people or misrepresent your identity.",
          ],
        },
        {
          title: "Your Content",
          description: "You own the content you share.",
          bullets: [
            "You grant Instanct a limited license to host and display your content to operate the service.",
            "You are responsible for the content you post and its compliance with laws and policies.",
          ],
        },
        {
          title: "Account Actions",
          description: "We may take action when policies are violated.",
          bullets: [
            "We can suspend or remove accounts that violate these terms.",
            "We may update these terms and will notify you of material changes.",
          ],
        },
      ]}
    />
  );
};
