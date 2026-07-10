import { LegalDocument, LegalScreen } from "@/components/auth/LegalScreen";
import { useLocalSearchParams } from "expo-router";

export default function Screen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const document: LegalDocument = type === "privacy" ? "privacy" : "terms";
  return <LegalScreen document={document} />;
}
