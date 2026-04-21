import { ScrollView, View } from "react-native";
import { ProfileSection } from "./RenderSection";

export const ExperienceTab = ({
  profileSections,
  renderSection,
}: {
  profileSections: ProfileSection[];
  renderSection: (section: ProfileSection) => React.ReactNode;
}) => (
  <ScrollView className="flex-1 bg-background">
    <View className="flex flex-col gap-4">
      {profileSections
        .filter((s) => s.key === "experience" || s.key === "education")
        .map(renderSection)}
    </View>
  </ScrollView>
);
