import {
  View,
  ScrollView,
  RefreshControl,
  NativeSyntheticEvent,
} from "react-native";
import { ProfileSection } from "./RenderSection";
import { cn } from "@/lib/utils";
import { NativeScrollEvent } from "react-native";

interface InterestsTabProps {
  className?: string;
  profileSections: ProfileSection[];
  renderSection: (section: ProfileSection) => React.ReactNode;
  userId?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export const InterestsTab = ({
  className,
  profileSections,
  renderSection,
  userId,
  onRefresh,
  refreshing,
  onScroll,
}: InterestsTabProps) => (
  <ScrollView
    onScroll={onScroll}
    className={cn("flex-1 bg-background", className)}
    contentContainerStyle={{ paddingTop: 20, paddingBottom: 32 }}
    refreshControl={
      <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
    }
  >
    <View className="flex flex-col gap-6">
      {profileSections
        .filter((s) => s.key === "industries")
        .map((section) => renderSection({ ...section, userId }))}
    </View>
  </ScrollView>
);
