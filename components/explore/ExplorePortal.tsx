import { cn } from "@/lib/utils";
import { ApplicationHeader } from "../shared/AppHeader";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";

interface ExplorePortalProps {
  className?: string;
}

export const ExplorePortal = ({ className }: ExplorePortalProps) => {
  return (
    <StableSafeAreaView className={cn("px-2", className)}>
      <ApplicationHeader title="Explore" />
    </StableSafeAreaView>
  );
};
