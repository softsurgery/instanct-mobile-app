import { ScrollView, View } from "react-native";
import { ProfileSection } from "./profile-section";

export const InterestsTab = ({
  profileSections,
  renderSection,
}: {
  profileSections: ProfileSection[];
  renderSection: (section: ProfileSection) => React.ReactNode;
}) => (
  <ScrollView className="flex-1 bg-background">
    <View className="flex flex-col gap-4">
      {profileSections.filter((s) => s.key === "industries").map(renderSection)}
    </View>
  </ScrollView>
);