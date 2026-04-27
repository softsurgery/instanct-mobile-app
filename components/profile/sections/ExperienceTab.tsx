import { View } from "react-native";
import { ProfileSection } from "./RenderSection";
import { cn } from "@/lib/utils";
import StableScrollView from "@/components/shared/StableScrollView";

export const ExperienceTab = ({
  className,
  profileSections,
  renderSection,
}: {
  className?: string;
  profileSections: ProfileSection[];
  renderSection: (section: ProfileSection) => React.ReactNode;
}) => (
  <StableScrollView className={cn("flex-1 bg-background", className)}>
    <View className="flex flex-col gap-4">
      {profileSections
        .filter((s) => s.key === "experience" || s.key === "education")
        .map(renderSection)}
    </View>
  </StableScrollView>
);
