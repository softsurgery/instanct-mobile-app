import { cn } from "@/lib/utils";
import { View } from "react-native";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { ProfileEntry } from "./ProfileEntry";

interface MenuPortalProps {
  className?: string;
}

export const MenuPortal = ({ className }: MenuPortalProps) => {
  return (
    <StableSafeAreaView className={cn("px-4", className)}>
      <ApplicationHeader title="Menu" />
      <View>
        <ProfileEntry />
      </View>
    </StableSafeAreaView>
  );
};
