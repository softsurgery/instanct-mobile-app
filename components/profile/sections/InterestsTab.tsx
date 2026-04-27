import { View } from "react-native";
import { ProfileSection } from "./RenderSection";
import StableScrollView from "@/components/shared/StableScrollView";

export const InterestsTab = ({
  profileSections,
  renderSection,
  userId,
}: {
  profileSections: ProfileSection[];
  renderSection: (section: ProfileSection) => React.ReactNode;
  userId?: string;
}) => (
  <StableScrollView className="flex-1 bg-background">
    <View className="flex flex-col gap-4">
      {profileSections
        .filter((s) => s.key === "industries")
        .map((section) => renderSection({ ...section, userId }))}
    </View>
  </StableScrollView>
);
