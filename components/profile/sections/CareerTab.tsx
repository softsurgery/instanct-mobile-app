import { RefreshControl, ScrollView, View } from "react-native";
import { ProfileSection } from "./RenderSection";
import { cn } from "@/lib/utils";

interface CarreerTabProps {
  className?: string;
  profileSections: ProfileSection[];
  renderSection: (section: ProfileSection) => React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const CareerTab = ({
  className,
  profileSections,
  renderSection,
  onRefresh,
  refreshing,
}: CarreerTabProps) => (
  <ScrollView
    className={cn("flex-1 bg-background", className)}
    contentContainerStyle={{ paddingTop: 20, paddingBottom: 32 }}
    refreshControl={
      <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
    }
  >
    <View className="flex flex-col gap-4">
      {profileSections
        .filter((s) => s.key === "experience" || s.key === "education")
        .map(renderSection)}
    </View>
  </ScrollView>
);
