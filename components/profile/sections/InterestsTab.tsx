import { View, ScrollView, RefreshControl } from "react-native";
import { ProfileSection } from "./RenderSection";
import { cn } from "@/lib/utils";

interface InterestsTabProps {
  className?: string;
  profileSections: ProfileSection[];
  renderSection: (section: ProfileSection) => React.ReactNode;
  userId?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const InterestsTab = ({
  className,
  profileSections,
  renderSection,
  userId,
  onRefresh,
  refreshing,
}: InterestsTabProps) => (
  <ScrollView
    className={cn("flex-1 bg-background", className)}
    refreshControl={
      <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
    }
  >
    <View className="flex flex-col gap-4">
      {profileSections
        .filter((s) => s.key === "industries")
        .map((section) => renderSection({ ...section, userId }))}
    </View>
  </ScrollView>
);
